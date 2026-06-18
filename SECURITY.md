# Security Policy

Security is our top priority. VyapaarAI handles critical operations, customer records, and billing transactions. We take all vulnerabilities with the utmost seriousness.

## Supported Versions

| Version | Supported |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| Older   | :x:                |

**Only the `main` branch and currently deployed production environments are actively supported.**

## Responsible Disclosure Policy

**NEVER open public GitHub issues for vulnerabilities.**

If you discover a security vulnerability within VyapaarAI, please send an email to:
**[security@vyapaarai.com](mailto:security@vyapaarai.com)**

### What to Include in Your Report
* Description of the vulnerability.
* Steps to reproduce the issue.
* Potential impact and severity.
* Any AI-generated code or workflow that might have introduced the flaw (if known).

### Expected Response Timelines
* **Initial Acknowledgement:** Within 24 hours.
* **Triage & Status Update:** Within 72 hours.
* **Patch Development:** High/Critical severity issues are prioritized immediately, halting all other feature development.

## Vulnerability Severity Handling

We use standard CVSS scoring to evaluate severity.
* **Critical:** Immediate hotfix, off-cycle deployment, forced session termination if necessary.
* **High:** Hotfix within 48 hours.
* **Medium/Low:** Patched in the next standard release cycle.

## Dependency Update Policy

* Dependencies are audited weekly via automated tools.
* Critical dependency patches are merged and deployed within 24 hours.
* We actively monitor supply-chain risks.

## Secrets Management

* NEVER commit secrets, API keys, or raw passwords to the repository.
* All environment variables must be documented in `.env.example` without real values.
* Database access credentials, encryption keys, and environment-level secrets are managed strictly through secured CI/CD injection and protected backend environments.

## AI-Generated Security Code Warning

**CRITICAL WARNING:** Any code handling authentication, authorization, cryptography, or direct database mutation MUST be rigorously hand-reviewed. AI models frequently hallucinate insecure default configurations or bypass standard sanitization layers. Do not trust AI-generated security layers without manual verification.
