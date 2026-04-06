#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const Parser = require("tree-sitter");
const CPP = require("tree-sitter-cpp");

const ROOT = path.resolve(__dirname, "../../..");
const RULES_PATH = path.resolve(__dirname, "../config/rules.json");
const rules = JSON.parse(fs.readFileSync(RULES_PATH, "utf8"));
const parser = new Parser();
parser.setLanguage(CPP);

function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function run(cmd) {
  try {
    return cp.execSync(cmd, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch (err) {
    return "";
  }
}

function listChangedFiles() {
  const base = process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : "HEAD~1";
  const out = run(`git diff --name-only ${base}...HEAD`);
  return out.split("\n").map((x) => x.trim()).filter(Boolean);
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(path.relative(ROOT, full));
    }
  }
}

function listAllFiles() {
  const files = [];
  walk(ROOT, files);
  return files;
}

function isCppFile(file) {
  return rules.fileExtensions.some((ext) => file.endsWith(ext));
}

function getLine(source, row) {
  const lines = source.split("\n");
  return lines[row] || "";
}

function addFinding(findings, finding) {
  findings.push({
    severity: "warning",
    ...finding,
  });
}

function traverse(node, cb) {
  cb(node);
  for (const child of node.namedChildren) {
    traverse(child, cb);
  }
}

function nodeText(source, node) {
  return source.slice(node.startIndex, node.endIndex);
}

function checkNaming(file, source, tree, findings) {
  if (!rules.naming.enabled) {
    return;
  }
  const classRe = new RegExp(rules.naming.classPascalCase);
  const fnRe = new RegExp(rules.naming.functionCamelCase);

  traverse(tree.rootNode, (node) => {
    if (node.type === "class_specifier") {
      const nameNode = node.childForFieldName("name");
      if (nameNode) {
        const name = nodeText(source, nameNode);
        if (!classRe.test(name)) {
          addFinding(findings, {
            ruleId: "RULE-NAMING-CLASS",
            file,
            line: nameNode.startPosition.row + 1,
            message: `Class name '${name}' should match ${rules.naming.classPascalCase}`,
            suggestion: "Rename class to PascalCase.",
          });
        }
      }
    }

    if (node.type === "function_definition") {
      const decl = node.childForFieldName("declarator");
      if (!decl) {
        return;
      }
      let id = null;
      const stack = [decl];
      while (stack.length && !id) {
        const cur = stack.pop();
        if (cur.type === "identifier" || cur.type === "field_identifier") {
          id = cur;
          break;
        }
        for (const child of cur.namedChildren) {
          stack.push(child);
        }
      }
      if (!id) {
        return;
      }
      const fnName = nodeText(source, id);
      if (rules.naming.ignoreFunctionNames.includes(fnName)) {
        return;
      }
      if (!fnRe.test(fnName)) {
        addFinding(findings, {
          ruleId: "RULE-NAMING-FUNCTION",
          file,
          line: id.startPosition.row + 1,
          message: `Function name '${fnName}' should match ${rules.naming.functionCamelCase}`,
          suggestion: "Rename function to camelCase.",
        });
      }
    }
  });
}

function checkForbiddenConstructs(file, source, tree, findings) {
  if (!rules.forbiddenConstructs.enabled) {
    return;
  }

  for (const token of rules.forbiddenConstructs.forbiddenTokens) {
    const lines = source.split("\n");
    lines.forEach((line, index) => {
      if (line.includes(token)) {
        addFinding(findings, {
          ruleId: "RULE-FORBIDDEN-TOKEN",
          file,
          line: index + 1,
          message: `Forbidden token '${token}' detected.`,
          suggestion: "Use approved control-flow alternatives.",
        });
      }
    });
  }

  traverse(tree.rootNode, (node) => {
    if (node.type !== "call_expression") {
      return;
    }
    const fn = node.childForFieldName("function");
    if (!fn) {
      return;
    }
    const name = nodeText(source, fn).replace(/\s+/g, "");
    if (rules.forbiddenConstructs.forbiddenFunctions.includes(name)) {
      addFinding(findings, {
        ruleId: "RULE-FORBIDDEN-FUNCTION",
        file,
        line: fn.startPosition.row + 1,
        message: `Forbidden function '${name}' detected.`,
        suggestion: "Replace with safer project-approved alternative.",
      });
    }
  });
}

function parseIncludes(source) {
  return source
    .split("\n")
    .map((line, index) => ({ line, index: index + 1 }))
    .filter((row) => row.line.trim().startsWith("#include"))
    .map((row) => {
      const isSystem = row.line.includes("<") && row.line.includes(">") && !row.line.includes('"');
      const key = row.line.replace(/^\s*#include\s*/, "").trim();
      return { ...row, isSystem, key };
    });
}

function checkIncludeStructure(file, source, findings) {
  if (!rules.includeStructure.enabled) {
    return;
  }

  const includes = parseIncludes(source);
  if (includes.length < 2) {
    return;
  }

  if (rules.includeStructure.requireSystemBeforeLocal) {
    let seenLocal = false;
    for (const inc of includes) {
      if (!inc.isSystem) {
        seenLocal = true;
      }
      if (inc.isSystem && seenLocal) {
        addFinding(findings, {
          ruleId: "RULE-INCLUDE-ORDER-GROUP",
          file,
          line: inc.index,
          message: "System includes must come before local includes.",
          suggestion: "Move <...> include lines before \"...\" include lines.",
        });
        break;
      }
    }
  }

  if (rules.includeStructure.sortWithinGroups) {
    const groups = {
      system: includes.filter((x) => x.isSystem),
      local: includes.filter((x) => !x.isSystem),
    };
    for (const group of Object.values(groups)) {
      const keys = group.map((x) => x.key);
      const sorted = [...keys].sort((a, b) => a.localeCompare(b));
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== sorted[i]) {
          addFinding(findings, {
            ruleId: "RULE-INCLUDE-ORDER-SORT",
            file,
            line: group[i].index,
            message: "Include lines should be sorted alphabetically within group.",
            suggestion: "Sort include lines alphabetically.",
          });
          return;
        }
      }
    }
  }
}

function collectTargetFiles() {
  const filesArg = getArg("--files");
  if (filesArg) {
    return filesArg.split(",").map((x) => x.trim()).filter(Boolean);
  }
  if (hasArg("--changed")) {
    return listChangedFiles();
  }
  return listAllFiles();
}

function main() {
  const candidateFiles = collectTargetFiles().filter(isCppFile);
  const findings = [];

  for (const rel of candidateFiles) {
    const filePath = path.resolve(ROOT, rel);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const source = fs.readFileSync(filePath, "utf8");
    let tree;
    try {
      tree = parser.parse(source);
    } catch (err) {
      addFinding(findings, {
        ruleId: "RULE-PARSE-ERROR",
        file: rel,
        line: 1,
        message: "Failed to parse file with tree-sitter.",
        suggestion: "Check syntax validity or exclude file.",
      });
      continue;
    }

    checkNaming(rel, source, tree, findings);
    checkForbiddenConstructs(rel, source, tree, findings);
    checkIncludeStructure(rel, source, findings);
  }

  if (findings.length === 0) {
    console.log("No convention findings.");
    return;
  }

  for (const f of findings) {
    console.log([
      f.ruleId,
      f.severity,
      `${f.file}:${f.line}`,
      f.message,
      f.suggestion,
    ].join(" | "));
  }

  process.exitCode = hasArg("--warn-only") ? 0 : 1;
}

main();
