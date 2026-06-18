# Contributing to VyapaarAI

Thank you for contributing to VyapaarAI! We maintain high architectural standards to keep the monorepo simple, robust, and easy to build.

## Code Conventions

### Conventional Commits
All commits must follow the Conventional Commits specification:
- `feat(scope): description` - e.g. `feat(invoices): sequential invoice generation`
- `fix(scope): description` - e.g. `fix(auth): correct token validation check`
- `docs(scope): description` - e.g. `docs(readme): add studio setup guides`

We enforce these syntax requirements via **Husky** and **commitlint** pre-commit validation.

### Architecture Guidelines
1. **NPM Workspaces:** The monorepo uses NPM workspaces. Never add third-party packages directly via npm command unless running within standard workspace commands:
   ```bash
   npm install [pkg] --workspace=apps/api
   ```
2. **Backend is Source of Truth:** Never rely on the client frontend for financial calculation validation. Always recalculate subtotals and GST rates (static 18%) inside the NestJS services before DB insertion.
3. **Database Precision:** Always use Prisma `Decimal` types for monetary properties.
4. **Soft Deletion Enforced:** Standard records should implement soft deletions (`deletedAt` field). Prisma queries will automatically filter them out using global query extensions.

## PR Checklist
1. All static tests (`npm run lint`) must pass.
2. All unit tests (`npm run test`) must pass.
3. Verify that compilation output (`npm run build`) builds cleanly.
