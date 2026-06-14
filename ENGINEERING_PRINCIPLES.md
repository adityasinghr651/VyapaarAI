# FlowGuard Engineering Principles

Welcome to the core engineering principles of FlowGuard. As a commercial AI-native SaaS platform focused on automation reliability and compliance-grade orchestration, we adhere strictly to the following standards.

## Engineering Philosophy

* **Architecture before velocity:** A solid foundation prevents technical debt.
* **Reliability before hype:** We build for uptime, not just trends.
* **Human review before AI merges:** AI assists; humans decide.
* **Clarity before cleverness:** Code is read 100x more than it is written.
* **Maintainability before abstraction:** Premature abstraction is the root of all evil.
* **Security before automation:** No automation should compromise system security.
* **Determinism before autonomous behavior:** We must always know exactly what our workflows will do.

## AI Coding Governance

| Rule | Description |
|---|---|
| **No Direct Merges** | AI-generated code MUST NOT be merged directly without a thorough human review. |
| **Architectural Tradeoffs** | PRs containing AI-generated logic must explicitly document the architectural tradeoffs made. |
| **No Hallucinated Abstractions** | If an AI suggests a new abstraction layer, it must be rigorously justified before inclusion. |

## Architecture Discipline

| Component | Rule |
|---|---|
| **Determinism** | Deterministic workflows are preferred over unpredictable, state-heavy autonomous actions. |
| **Premature Abstractions** | Banned. Build for the current requirement. Refactor when the pattern repeats three times. |
| **Business Logic** | No business logic duplication across services or UI components. |

## Code Quality Standards

* **Human-Readable Code Mandatory:** The codebase must be understandable by a mid-level engineer without deep domain expertise.
* **No Hidden Side Effects:** Functions must be pure where possible. Mutations must be explicit and localized.
* **Strict TypeScript:** `tsconfig.json` MUST have `strict: true`.
* **No `any`:** The use of the `any` type is strictly prohibited. Use `unknown` if truly necessary, and assert with guards.
* **Small Focused PRs:** Max file size target is < 500 LOC. PRs should solve one specific problem.
* **Naming Conventions:** Clear, descriptive naming is mandatory. No single-letter variables outside of standard loop indices.

## Security Standards

* **Security-First Engineering:** All inputs must be validated. All data must be sanitized.
* **Audit Logging:** Mandatory for all critical workflows and state-changing actions.
* **No Silent Failures:** Errors must be caught, logged, and either handled or bubbled up. Swallowing errors is a critical violation.

## PR Expectations

* Code must compile and all tests must pass.
* All PRs must explain the *why*, not just the *what*.
* Small, frequent PRs are preferred over massive feature drops.

## Testing Philosophy

* **Core Business Logic:** Tests are absolutely required for all core business logic and critical paths.
* **Integration Tests:** Required for all API endpoints and database interactions.

## Scalability Principles

* Build stateless services where possible.
* Rely on the database for strict consistency; use queues for asynchronous processing.
* Optimize for the 99th percentile latency.

## Anti-Patterns to Avoid

* **God Objects:** Classes or modules that know too much or do too much.
* **Spaghetti Code:** Unstructured and difficult-to-maintain code, often caused by lack of clear architectural boundaries.
* **Magic Numbers/Strings:** Hardcoded values scattered throughout the codebase. Use constants or configuration instead.
