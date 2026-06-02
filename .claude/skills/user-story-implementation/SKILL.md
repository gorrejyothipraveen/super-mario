
---
name: user-story-implementation

description: |
  Use this skill when the user wants to implement a GitHub user story, issue,
  enhancement, bug fix, or technical task.

  This skill orchestrates the complete implementation lifecycle:
  fetching issue details, analyzing repository context, creating an execution
  plan, validating assumptions with the user, implementing incrementally,
  running tests and validations, and generating clean commits.

  The skill prioritizes correctness, maintainability, repository consistency,
  and minimal-risk implementation.

triggers:
  - implement story
  - implement issue
  - work on github issue
  - implement feature
  - fix issue
  - implement user story
  - complete task
  - start implementation

inputs:
  - github_issue_id
  - github_issue_url
  - feature_description
  - repository_context

tools:
  - git
  - github
  - terminal
  - codebase_search
  - test_runner

---

# Purpose

The purpose of this skill is to autonomously and safely implement a user story
while collaborating with the user at key decision points.

The skill must:
- understand the issue deeply
- analyze existing architecture
- minimize regressions
- follow repository conventions
- implement incrementally
- validate changes continuously
- produce production-quality commits

---

# Execution Workflow

## Phase 1 — Fetch & Understand Context

### Objectives
- Retrieve the issue/story details
- Understand acceptance criteria
- Identify impacted systems
- Gather repository context

### Actions
1. Fetch issue details from GitHub
2. Extract:
   - requirements
   - acceptance criteria
   - constraints
   - linked PRs/issues
   - screenshots/examples
3. Analyze repository structure
4. Detect:
   - framework
   - architecture style
   - coding conventions
   - testing framework
   - linting setup
   - package manager
5. Identify relevant modules/files

### Deliverables
- concise issue summary
- impacted areas
- technical observations
- assumptions list
- unknowns/questions

### Rules
- Never start implementation before repository analysis
- Never assume architecture patterns without verification
---

## Phase 2 — Deep Codebase Analysis

### Objectives
Understand how the feature should integrate into the existing system.

### Actions
1. Search for:
   - similar features
   - reusable components
   - existing APIs/services
   - utility functions
   - domain models
2. Trace execution flows
3. Analyze dependencies and side effects
4. Identify integration points
5. Detect potential breaking changes

### Deliverables
- implementation strategy
- reuse opportunities
- dependency impact analysis
- risk assessment

### Rules
- Prefer extending existing abstractions over introducing new ones
- Avoid duplicate logic
- Preserve existing architectural boundaries

---

## Phase 3 — Collaborative Planning

### Objectives
Create a clear implementation plan before coding.

### Actions
1. Break work into atomic tasks
2. Estimate complexity/risk per task
3. Present implementation plan to user
4. Ask clarification questions if needed
5. Wait for approval before implementation

### Deliverables
- ordered task list
- implementation sequence
- validation strategy
- rollback considerations

### Rules
- Do not implement without user approval
- Keep tasks independently testable
- Prefer small iterative changes

---

## Phase 4 — Environment & Safety Validation

### Objectives
Ensure implementation can proceed safely.

### Actions
1. Verify:
   - dependencies install successfully
   - tests run
   - lint configuration works
   - build passes
2. Detect:
   - failing baseline tests
   - broken environments
   - missing secrets/config
3. Report blockers immediately

### Deliverables
- environment health report
- baseline test status

### Rules
- Never continue if repository is already unstable without informing user

---

## Phase 5 — Incremental Implementation

### Objectives
Implement the approved tasks safely and incrementally.

### Actions
For each task:
1. Re-evaluate affected code
2. Implement minimal scoped changes
3. Preserve backward compatibility
4. Add/update:
   - tests
   - types
   - documentation
5. Run targeted validations after each task

### Implementation Priorities
1. correctness
2. readability
3. maintainability
4. consistency with existing codebase
5. performance optimization

### Rules
- Never refactor unrelated code
- Never introduce broad architectural changes unless explicitly requested
- Keep commits logically grouped
- Avoid speculative abstractions

---

## Phase 6 — Validation & Quality Gates

### Objectives
Ensure implementation quality before finalization.

### Required Validations
- lint passes
- formatting passes
- type checks pass
- unit tests pass
- integration tests pass (if applicable)
- build succeeds
- no unintended file modifications

### Additional Checks
- regression analysis
- edge case validation
- error handling verification
- accessibility validation (if UI related)

### Rules
- Never commit failing code
- If tests fail, inform user and then:
  - analyze root cause
  - attempt fixes
  - report unresolved failures clearly

---

## Phase 7 — Review & Diff Analysis

### Objectives
Review the implementation critically before commit.

### Actions
1. Analyze git diff
2. Verify:
   - scope alignment
   - code quality
   - naming consistency
   - dead code absence
   - accidental changes absence
3. Summarize implementation

### Deliverables
- implementation summary
- changed files summary
- risks/limitations
- follow-up recommendations

---

## Phase 8 — Commit & Finalization

### Objectives
Create high-quality commit history.

### Actions
1. Generate semantic commit message
2. Group related changes logically
3. Create commit

### Commit Format
Use conventional commits:

- feat:
- fix:
- refactor:
- test:
- docs:
- chore:

### Commit Message Rules
- concise subject line
- explain intent, not implementation details
- reference issue/story ID when applicable

### Example
feat(auth): implement password reset workflow (#142)

---

# Behavioral Guidelines

## Decision Making
- Prefer repository consistency over personal preference
- Prefer simple solutions over clever abstractions
- Ask for clarification when requirements are ambiguous

## Safety
- Never delete large sections of code without confirmation
- Never overwrite user changes blindly
- Never expose secrets or credentials

## Communication Style
Be concise but precise.

Always communicate:
- current phase
- what is being analyzed
- what changed
- why changes were made
- validation results

---

# Failure Handling

If blocked:
1. explain the blocker
2. provide root cause analysis
3. propose possible resolutions
4. ask user how to proceed

Examples:
- missing environment variables
- failing baseline tests
- ambiguous acceptance criteria
- dependency conflicts
- unsupported architecture assumptions

---

# Success Criteria

The task is considered complete only if:
- acceptance criteria are satisfied
- validations pass
- implementation aligns with repository conventions
- tests cover introduced behavior
- changes are committed cleanly
- user-facing summary is generated
