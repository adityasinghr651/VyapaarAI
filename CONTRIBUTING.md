# Contributing to FlowGuard

First off, thank you for considering contributing to FlowGuard. This repository prioritizes commercial-first, production-grade engineering. We expect all contributions to adhere to our rigorous standards of reliability, clarity, and architectural integrity.

## Development Workflow

### Local Setup
Please see our [Setup Guide](./docs/SETUP_GUIDE.md) for instructions on bootstrapping the repository locally.

### Branch Naming Conventions

We use a strict branch naming convention to keep our CI/CD pipelines and history clean:

* `feat/` - New features (e.g., `feat/audit-logging`)
* `fix/` - Bug fixes (e.g., `fix/user-auth-token`)
* `docs/` - Documentation updates
* `refactor/` - Code restructuring without changing behavior
* `chore/` - Tooling, dependency updates, maintenance
* `test/` - Adding or modifying tests

### Conventional Commits

All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat: add robust audit logging for workflows`
* `fix: correct token validation bypass`
* `docs: update architecture boundaries`
* `refactor: extract workflow engine to service layer`
* `test: cover edge cases in payment processing`
* `chore: upgrade Next.js to latest stable`

## Pull Request Review Process

### PR Requirements

1. **Human Approval:** At least 1 human approval is **mandatory** for all PRs.
2. **Tests:** All CI pipelines and tests must be passing.
3. **DRY Logic:** No duplicated business logic.
4. **Architecture:** Major changes must include a clear explanation of architectural tradeoffs.
5. **Visuals:** Screenshots or screen recordings are strictly required for ANY UI changes.

### AI Contribution Rules

* If AI coding tools (e.g., Copilot, Cursor, Gemini) were used to generate a significant portion of the PR, you MUST disclose this in the PR description.
* AI-generated code is held to the exact same (or higher) standard of scrutiny as human-written code.
* You are entirely responsible for the code you commit. "The AI wrote it" is not an acceptable excuse for bugs, poor architecture, or security flaws.

## Issue Handling

Please use the provided GitHub Issue Templates. We use strict issue categorization:
* Submit bugs via the Bug Report template.
* Submit features via the Feature Request template.

## Contributor Etiquette

* **Communication:** Keep conversations professional, objective, and engineering-focused.
* **Constructive Feedback:** Review code, not the coder. Provide actionable suggestions rather than plain criticism.
* **OSS Readiness:** While currently commercial, write all documentation and code as if it were a high-tier open-source project. This prepares us for future ecosystem scaling.
