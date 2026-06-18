# VyapaarAI Roadmap

VyapaarAI is evolving systematically. Our roadmap is designed to ensure stability, transaction accuracy, and deterministic execution at every phase of our SMB Operations Platform.

## High-Level Commercial and Technical Direction

| Phase | Title | Focus | Target |
|---|---|---|---|
| **Phase 1** | **Core Operations & Billing Bedrock** | Establish the foundation: monorepo architecture, secure auth, transaction-safe invoicing, and robust customer/product schemas with audit trails. | Complete |
| **Phase 2** | **Reporting & Advanced Analytics** | Implement dynamic dashboards, tax reports (GST summaries), inventory alerts, and detailed customer transaction ledgers. | Next |
| **Phase 3** | **Integrations & Payments** | Add automated email/SMS invoice delivery, payment gateway integrations (e.g., Stripe, Razorpay), and automated invoice status reconciliation. | Q3 |
| **Phase 4** | **Enterprise Governance** | Role-based access control (RBAC), multi-tenant isolation, automated database archiving, and SOC2 compliance-ready audit trails. | Q4 |
| **Phase 5** | **AI-Powered Insights & Scaling** | AI-assisted cashflow forecasting, automated inventory optimization suggestions, and event-driven queue scaling (e.g., NestJS queues/BullMQ). | Future |

## Strategic Goals

### Scalability Goals
* Transition seamlessly from a synchronous modular monolith to an event-driven architecture using queues (e.g., BullMQ / Redis) for heavy processes like PDF generation and mail deliveries.
* Maintain sub-200ms API response latency.

### Performance Optimization Goals
* Optimize Next.js App Router caching and React Query data synchronization.
* Optimize database indexing on query-heavy tables (e.g., `invoices`, `audit_logs`, `customers`).

### Failure Prevention & Auditability
* Zero silent failures: Ensure database errors and API request rejections are traced using centralized interceptors.
* Immutable audit trails: Keep detailed histories of all data mutations via the `audit` module.

### Future Architecture Considerations
* Keep clear separation between backend business logic in services and presentation in controllers to allow easy microservice extraction if needed.
