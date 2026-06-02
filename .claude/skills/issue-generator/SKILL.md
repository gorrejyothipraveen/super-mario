---
name: issue-generator
description: Read the issues.md backlog file, break it into individual stories, and create GitHub Issues automatically.
tools:
  - Read
  - Write
  - Bash
  - GitHub
---

# Issue Generator Skill

## Purpose

This skill converts a structured backlog document (`issues.md`) into GitHub Issues.

It extracts:

- Epics
- User stories
- Acceptance criteria
- QA test cases

and creates properly formatted GitHub Issues automatically.

---

# Input

Expected file:

```bash
issues.md
````

The file contains:

* Epic sections
* Story sections
* User stories
* Acceptance criteria
* QA test cases

---

# Responsibilities

The skill should:

1. Read `issues.md`
2. Parse all epics
3. Parse all stories under each epic
4. Create one GitHub Issue per story
5. Add labels
6. Preserve epic-story hierarchy
7. Generate clean markdown issue descriptions

---

# Parsing Rules

## Epic Detection

Epic headings follow:

```md
# Epic X — Epic Name
```

Example:

```md
# Epic 2 — Authentication
```

---

## Story Detection

Story headings follow:

```md
## Story X.X — Story Name
```

Example:

```md
## Story 2.1 — User Registration
```

---

# Issue Format

Each GitHub issue should contain:

```md
# User Story

As a player,
I want to register an account
so my progress can be saved.

---

# Acceptance Criteria

- Email/password registration
- Input validation
- Password hashing
- Duplicate prevention

---

# QA Test Cases

- Verify invalid email rejection
- Verify duplicate account handling
- Verify password encryption
```

---

# Labels

Suggested labels:

| Type           | Label       |
| -------------- | ----------- |
| Epic           | epic        |
| Story          | story       |
| Authentication | auth        |
| Backend        | backend     |
| Frontend       | frontend    |
| Game Engine    | game-engine |
| QA             | testing     |

---

# Suggested Workflow

## Step 1 — Read backlog

Read:

```bash
issues.md
```

---

## Step 2 — Extract epics

Identify all epic sections.

---

## Step 3 — Extract stories

For each story:

* title
* user story
* acceptance criteria
* QA test cases

---

## Step 4 — Create GitHub Issues

Create one issue per story.

Example title:

```text
[Authentication] User Registration
```

---

## Step 5 — Apply labels

Apply:

* epic label
* module label
* story label

---

# Example Output

## GitHub Issue Title

```text
[Player Mechanics] Player Jump
```

## GitHub Issue Body

```md
# User Story

As a player,
I want jumping functionality.

---

# Acceptance Criteria

- Gravity applied
- Jump animation
- Platform collision

---

# QA Test Cases

- Verify jump height
- Verify collision handling
- Verify landing behavior
```

---

# Error Handling

If parsing fails:

* skip malformed sections
* continue remaining stories
* log warnings

---

# Notes

* Do not create duplicate issues
* Preserve story numbering
* Maintain markdown formatting
* Keep issue descriptions concise

```