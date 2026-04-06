# Product Brief: C++ Code Convention Compliance Program

## Executive Summary

This initiative establishes a practical, enforceable C++ code convention across the team to improve maintainability, reduce review friction, and increase delivery predictability. Today, developers spend unnecessary time debating style and fixing inconsistent patterns instead of focusing on design and correctness. The program introduces a single source of truth for conventions and automates enforcement in local workflows and CI.

The outcome is not just cleaner code. It is a faster engineering system: clearer pull requests, easier onboarding, fewer style regressions, and a repeatable quality baseline that scales as the codebase and team grow.

The initiative is intended as a focused AI-assisted effort delivered over 3-4 working days, prioritizing fast standard definition, practical enforcement, and lightweight rollout over heavy process overhead.

## The Problem

The current C++ workflow suffers from inconsistent coding patterns across files and contributors.

- Review cycles are slowed by repeated style discussions.
- New contributors lack clear guidance for naming, formatting, and modern C++ usage.
- Convention drift accumulates technical debt and raises maintenance cost.
- Static analysis and formatting are applied inconsistently, causing avoidable CI failures.

The status quo creates hidden costs in lead time, developer focus, and long-term code health.

## The Solution

Create and operationalize a C++ convention framework that is explicit, lightweight, and tool-enforced.

- Define a baseline style guide for formatting, naming, includes, and language idioms.
- Standardize on automated tooling for formatting and linting.
- Gate pull requests with convention checks for changed C++ files.
- Provide migration guidance for legacy code and clear exceptions policy.

This approach moves convention compliance from subjective review opinion to objective, automated quality control.

## What Makes This Different

- Enforcement-first design: rules are backed by tooling, not documentation alone.
- Incremental rollout strategy: apply to touched files first, then expand.
- Developer-friendly adoption: clear examples, minimal ceremony, and fast feedback loops.
- Metrics-led governance: track compliance and review friction reduction over time.

## Who This Serves

Primary users:

- C++ developers who need fast, unambiguous coding guidance.
- Code reviewers who need to focus on architecture and correctness over style policing.

Secondary users:

- Engineering managers tracking team velocity and quality trends.
- New hires onboarding into an existing C++ codebase.

## Success Criteria

- 90%+ convention compliance on changed C++ files within 4 weeks of rollout.
- 30% reduction in style-related pull request comments.
- 100% of new/updated C++ pull requests passing formatting and lint checks.
- Reduced time-to-review median for C++ pull requests (target to be baseline-driven).

## Scope

In scope (Phase 1):

- Convention definition for formatting, naming, include order, and common C++ patterns.
- Tooling configuration for formatter/linter and CI validation.
- Pull request policy for convention compliance on touched files.
- Documentation and onboarding examples.

Out of scope (Phase 1):

- Large-scale refactoring of untouched legacy modules.
- Architecture redesign unrelated to convention compliance.
- Performance optimization work not tied to code-quality standards.

## Technical Approach (High-Level)

- Use formatter and linter toolchain integrated into local development and CI.
- Use GitHub tree-sitter as the syntax-tree analysis layer for custom structural convention checks that are hard to enforce with formatting alone.
- Establish a baseline profile aligned to team needs and modern C++ practices.
- Support phased migration with explicit suppressions/waivers where justified.
- Publish quick-reference examples for high-frequency rules.

## Delivery Timeline

- Day 1: Assess current conventions, confirm baseline style direction, and define Phase 1 scope.
- Day 2: Draft the convention rules, formatter/linter configuration, and enforcement approach.
- Day 3: Integrate AI-assisted checks, validate sample files, and refine exception handling.
- Day 4: Finalize rollout guidance, onboarding notes, and handoff artifacts if needed.

## Risks and Mitigations

- Risk: Adoption resistance due to perceived overhead.
  Mitigation: Phased rollout, auto-fix where possible, and clear rationale per rule.

- Risk: Legacy code churn from strict enforcement.
  Mitigation: Apply strict checks to touched files first; schedule targeted cleanup windows.

- Risk: Overly rigid rules harming productivity.
  Mitigation: Governance loop with periodic review and measured exception handling.

## Vision

Within 6-12 months, convention compliance becomes a default behavior rather than a manual review concern. Engineering energy shifts from style arbitration to solving product and system problems. The codebase becomes easier to read, safer to modify, and simpler to scale across teams and contributors.

## Decisions to Confirm in Next Step

- Style baseline: Google, LLVM, or custom profile.
- Target language level: C++17, C++20, or C++23.
- Enforcement stack: exact formatter/linter/checker tools, with GitHub tree-sitter for custom AST-based checks.
- Rollout mode: strict immediate vs phased by repository area.
- Primary KPI priority: review speed, CI stability, or onboarding speed.