---
stepsCompleted:
  - scope-definition
  - option-analysis
  - recommendation
inputDocuments:
  - /home/minhnb/BMAD_Group2_Demo/_bmad-output/planning-artifacts/product-brief-cpp-code-convention-compliance.md
workflowType: research
lastStep: 4
research_type: technical
research_topic: C++ code convention compliance
research_goals: Select baseline style, tooling stack, and rollout strategy deliverable in 3-4 days.
user_name: Minhnb
date: 2026-04-06
web_research_enabled: false
source_verification: false
---

# Research Report: Technical

**Date:** 2026-04-06
**Author:** Minhnb
**Research Type:** Technical

---

## Research Overview

This report converts the approved product brief into implementation-ready technical decisions for a 3-4 day AI-assisted C++ convention compliance effort. The analysis focuses on practical execution speed, maintainability, and low-friction developer adoption.

Note: This is a project-internal technical recommendation set and does not include external web benchmarking.

---

## Decision Framing

The project must make six decisions quickly:

1. Style baseline (Google, LLVM, or custom)
2. Target C++ standard level
3. Enforcement stack (formatter, linter, AST checks)
4. Rollout strategy
5. Exception governance
6. Short-horizon success metrics

## Options Analysis

### 1) Style Baseline

Option A: Google C++ Style
- Pros: Strong structure and broad references.
- Cons: Can feel opinionated for mixed legacy codebases.

Option B: LLVM Style
- Pros: Practical defaults and common fit for systems code.
- Cons: Still requires local adaptation in most repositories.

Option C: Fully Custom
- Pros: Perfect local fit.
- Cons: High setup and maintenance cost; slowest for 3-4 day timeline.

Assessment:
- For fast delivery, fully custom is not recommended.
- Start from an external baseline and add a thin local overlay.

### 2) C++ Standard Target

Option A: C++17
- Safe and common in mixed toolchains.

Option B: C++20
- Better language expressiveness and modern guidance.

Option C: C++23
- Useful in selected environments but can increase compatibility risk.

Assessment:
- Choose the highest standard already supported by your build and CI baseline.
- If uncertain, default to C++17 for immediate rollout and version forward later.

### 3) Enforcement Stack

Option A: Formatter-only
- Too weak; misses many structural and semantic conventions.

Option B: Formatter + Linter
- Strong base for phase 1; good automation coverage.

Option C: Formatter + Linter + AST Layer
- Best long-term fit for repository-specific structural checks.

Assessment:
- Recommended stack for this project:
  - clang-format for deterministic formatting
  - clang-tidy for common static and style checks
  - GitHub tree-sitter for custom AST-based structural rules not covered by generic tools

### 4) Rollout Strategy

Option A: Strict repo-wide day one
- High risk of legacy churn and team friction.

Option B: Touched-files-first
- Low friction, practical adoption, aligns with fast timeline.

Option C: Pilot module then expansion
- Adds validation confidence with limited blast radius.

Assessment:
- Combine B and C:
  - Start with one active pilot module
  - Enforce touched-files-first policy
  - Expand by module after stabilization

### 5) Exception Governance

Option A: Informal case-by-case
- Fast but inconsistent and hard to audit.

Option B: Structured waiver template
- Consistent and reviewable with expiry controls.

Assessment:
- Use structured waivers with owner, rationale, expiry date, and cleanup action.

### 6) Success Metrics

Recommended short-horizon metrics:
- CI convention check pass rate for changed C++ files
- Style-related PR comments per pull request
- Median review turnaround time for C++ pull requests
- Top recurring rule violations (for coaching and tuning)

## Final Recommendations

1. Baseline: Start with LLVM style and add a minimal local overlay.
2. C++ standard: Use currently supported repo baseline; default C++17 if uncertain.
3. Tooling stack: clang-format + clang-tidy + GitHub tree-sitter for custom structural rules.
4. Rollout: Pilot module plus touched-files-first enforcement.
5. Governance: Mandatory waiver template with expiry and owner.
6. KPIs: CI pass rate, style comment reduction, review time, top violations.

## 3-4 Day Execution Plan

### Day 1

- Confirm baseline choices and pilot module.
- Draft rule profile (must-have rules only).
- Define waiver template and ownership.

### Day 2

- Add formatter and linter configuration.
- Add CI checks for changed C++ files.
- Prepare local developer command shortcuts.

### Day 3

- Add initial tree-sitter custom checks for high-value structural rules.
- Validate on pilot module.
- Tune noisy checks and exception flow.

### Day 4

- Finalize quick-reference guidance.
- Publish rollout notes for next modules.
- Record KPI baseline and first-week targets.

## Risks and Controls

- Risk: CI noise slows delivery.
  Control: Start with must-have checks and phase in additional rules.

- Risk: Legacy churn creates friction.
  Control: Touched-files-first, no broad reformat in initial window.

- Risk: Tree-sitter check maintenance overhead.
  Control: Limit custom checks to gaps not covered by clang-format or clang-tidy.

## Output of This Step

This report is decision-ready input for implementation planning and engineering execution.
