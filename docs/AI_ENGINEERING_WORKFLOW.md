# AI Engineering Workflow Constitution

FlowGuard embraces AI as a force multiplier, but **architecture and deterministic reliability will always supersede autonomous velocity.** This document serves as the AI Engineering Constitution for the company.

## 1. Approved AI Coding Tools

* **Approved:** GitHub Copilot, Cursor, Google Gemini, ChatGPT (Enterprise Tiers).
* **Prohibited:** Unvetted third-party AI extensions that transmit proprietary codebase context to public models.

## 2. Human Review Requirements

* **Zero Auto-Merges:** AI-generated code MUST NOT be merged without human eyes.
* **Comprehension Mandatory:** If you use an AI to write a function, you must be able to explain exactly how it works, line by line, to a Staff Engineer. "I don't know, the AI wrote it" is a severe violation of engineering trust.

## 3. AI Code Validation Process

1. **Generate:** Use AI to scaffold boilerplate or suggest logic.
2. **Scrub:** Remove hallucinated abstractions or unnecessary complexity.
3. **Align:** Ensure the code fits strictly into our `/services` layer architecture.
4. **Test:** Write explicit unit tests for the AI-generated logic.
5. **Review:** Present the code in a PR, explicitly disclosing the use of AI.

## 4. Prompt Hygiene

* **Context is Key:** When prompting AI, feed it our `ENGINEERING_PRINCIPLES.md` and `ARCHITECTURE.md` to ensure it generates compliant code.
* **Avoid Magic:** Do not prompt AI to "just make it work." Prompt it to "implement a deterministic function adhering to our modular monolith service layer."

## 5. Security Review Process

AI models are notoriously bad at producing secure-by-default configurations.
* Any AI-generated code touching **Auth, DB Access, API validation, or cryptography** requires a manual, line-by-line security audit by a senior reviewer.
* Validate all inputs. Do not assume the AI included sanitization.

## 6. AI Hallucination Risks

Be actively vigilant against:
* **Phantom Libraries:** AI importing packages that don't exist.
* **Deprecation:** AI using outdated Next.js (Pages router) patterns instead of our mandated App Router standards.
* **Silent Failures:** AI wrapping logic in empty `try/catch` blocks.

## 7. Prohibited AI Usage Patterns

* **Mass Refactoring:** Do not use AI to bulk-rewrite core files without a granular, step-by-step implementation plan.
* **Blind Copy-Pasting:** Pasting code directly from ChatGPT into the IDE without formatting, typing, and architectural alignment.
* **Bypassing Tests:** Using AI to write tests that tautologically pass just to satisfy coverage metrics.
