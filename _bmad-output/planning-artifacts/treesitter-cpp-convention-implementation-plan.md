---
plan_type: implementation
topic: tree-sitter cpp convention enforcement
date: 2026-04-06
owner: Minhnb
status: ready-for-execution
inputs:
  - /home/minhnb/BMAD_Group2_Demo/_bmad-output/planning-artifacts/product-brief-cpp-code-convention-compliance.md
  - /home/minhnb/BMAD_Group2_Demo/_bmad-output/planning-artifacts/technical-cpp-code-convention-compliance-research-2026-04-06.md
---

# Tree-sitter Implementation Plan: C++ Convention Compliance

## Objective

Implement a minimal, high-value GitHub tree-sitter rule layer for C++ convention checks that are not reliably covered by formatter and linter tools, while preserving a 3-4 day delivery timeline.

## Scope for Tree-sitter Layer

In scope:
- AST-based structural convention checks only
- Checks on changed files or changed lines where feasible
- CI reporting with actionable diagnostics

Out of scope:
- Replacing clang-format or clang-tidy
- Deep semantic checks requiring full type resolution
- Repo-wide refactor automation

## Rule Selection Strategy

Use this filter for every candidate rule:

1. Cannot be enforced by clang-format
2. Weak or noisy in clang-tidy for your repository constraints
3. Detectable from syntax tree shape and token text
4. Produces clear remediation guidance

Only rules that pass all four criteria enter Phase 1.

## Phase 1 Rule Backlog (Recommended)

### R1: Naming pattern enforcement for selected symbols

Goal:
- Enforce project naming conventions on class names, function names, and constants.

Tree-sitter fit:
- Strong for extracting identifier nodes and applying regex rules.

Output format:
- File path, line, symbol kind, expected pattern, actual value.

### R2: Forbidden construct detection

Goal:
- Block known disallowed patterns (project-specific anti-patterns), such as selected macros or raw ownership patterns where policy requires wrappers.

Tree-sitter fit:
- Good for direct syntactic pattern detection.

Output format:
- File path, line, matched construct, approved alternative.

### R3: Header and source structural policy checks

Goal:
- Validate structural repository rules such as include ordering categories, required include guard style in non-pragma projects, or designated file organization rules.

Tree-sitter fit:
- Strong for include node extraction and order verification.

Output format:
- File path, line, expected structure, observed structure.

## Rule Deferred to Later

Do not include in Day 1-4 scope:
- Complex ownership and lifetime correctness rules requiring semantic/type analysis
- Full architecture-layer dependency graph checks
- Cross-file symbol intent validation

## Repository Layout Proposal

Create a minimal checker package inside the repository:

- tools/convention-checks/
- tools/convention-checks/README.md
- tools/convention-checks/package.json
- tools/convention-checks/src/run-checks.js
- tools/convention-checks/src/rules/
- tools/convention-checks/src/rules/naming.js
- tools/convention-checks/src/rules/forbidden-constructs.js
- tools/convention-checks/src/rules/include-structure.js
- tools/convention-checks/src/output/formatter.js
- tools/convention-checks/config/rules.json

## Execution Plan (3-4 Days)

### Day 1: Rule Contract and Skeleton

- Confirm naming patterns and forbidden constructs list with owners.
- Create checker skeleton and rule config format.
- Define CLI interface:
  - input path list
  - changed-files mode
  - changed-lines mode (optional)
  - output format: human and CI-friendly

Exit criteria:
- Checker runs and returns zero findings on empty/no-op input.

### Day 2: Implement Core Rules

- Implement R1 naming rule.
- Implement R2 forbidden constructs rule.
- Implement R3 include-structure rule (minimal first pass).
- Add clear remediation text for each finding.

Exit criteria:
- Rules detect seeded violations in test sample files.

### Day 3: CI Integration and Pilot Validation

- Integrate checker command into CI for changed C++ files.
- Add non-blocking mode first (warn) for pilot branch.
- Validate diagnostics readability with reviewers.
- Tune false positives and improve messages.

Exit criteria:
- CI produces stable findings with acceptable noise level.

### Day 4: Policy Hardening and Handoff

- Switch selected rules from warn to block.
- Document waiver process for unavoidable exceptions.
- Publish quick usage guide for local runs.
- Capture baseline metrics from pilot cycle.

Exit criteria:
- At least one pilot module runs checker in CI and developers can run locally.

## CI Integration Model

Run order:
1. format-check (clang-format)
2. lint-check (clang-tidy)
3. tree-sitter structural-check

Policy:
- Start structural-check in warn mode for first cycle
- Promote high-confidence rules to blocking once false-positive rate is acceptable

## Diagnostics Contract

Every finding must include:
- Rule ID
- Severity
- File path
- 1-based line number
- Short explanation
- Suggested fix or reference

Example:
- RULE-NAMING-CLASS | warning | src/foo/bar.cpp:42 | Class name violates PascalCase | Rename to PascalCase form

## Quality Gates

Phase 1 gate to move from warn to block:
- False-positive rate low enough for reviewer trust
- Findings include actionable remediation
- Team agreement on exception policy

## Risk Register (Tree-sitter Specific)

- Risk: Too many custom rules increase maintenance burden.
  Mitigation: Keep only high-value AST checks in Phase 1.

- Risk: Noisy diagnostics reduce adoption.
  Mitigation: Pilot in warn mode and tune messages before blocking.

- Risk: Rule overlap with clang-tidy causes duplication.
  Mitigation: Maintain rule ownership map per tool and avoid duplicates.

## Deliverables

1. Tree-sitter checker skeleton and rule modules
2. Rule catalog with IDs and remediation guidance
3. CI integration in warn-then-block mode
4. Pilot validation summary with tuning notes

## Ready-to-Run Checklist

- [ ] Pilot module selected
- [ ] Naming regex policy confirmed
- [ ] Forbidden constructs list approved
- [ ] Include structure policy finalized
- [ ] Rule config file initialized
- [ ] Local checker command added
- [ ] CI job wired for changed C++ files
- [ ] Warn-mode trial completed
- [ ] Blocking promotion criteria met
