# VyapaarAI Monorepo — Architectural Analysis & Execution Backlog

Based on a comprehensive inspection of the **current state** of the repository, here is the verified execution backlog and gap analysis. 

> [!NOTE]
> The previous analysis you provided was outdated. Phase 1 (Foundation through WhatsApp Layer) has been **fully implemented**. The architecture currently supports robust multi-tenancy, Row Level Security (RLS), full CRUD ledgers, and the foundational webhook layers required to interact with WhatsApp.

---

### # Phase 1.1 — Critical Foundation
| Module | Status | Verified State | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | -------------- | ------------ | ---------- | ---- | --------------- |
| Multi-tenant architecture | ✅ Complete | `Organization` model exists. `tenantId` is strictly bound to all operational models (`Customer`, `Product`, `Invoice`). | None | - | - | - |
| Row-Level Security | ✅ Complete | Supabase PostgreSQL RLS policies map to `tenantId`. Enforced at the database connection layer via `PrismaService` extensions. | Multi-tenant architecture | - | - | - |
| RBAC | ✅ Complete | `@Roles` guard actively restricts endpoints to `OWNER`, `ACCOUNTANT`, and `STAFF`. | Multi-tenant architecture | - | - | - |
| Audit Log improvements | ✅ Complete | Complete immutable ledger in `AuditService`. Successfully injected into CRUD transactions capturing `tenantId` and metadata. | Multi-tenant architecture | - | - | - |

### # Phase 1.2 — Core CRUD
| Module | Status | Verified State | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | -------------- | ------------ | ---------- | ---- | --------------- |
| Customers API | ✅ Complete | NestJS Controllers/Services for strict CRUD. | Phase 1.1 | - | - | - |
| Products API | ✅ Complete | NestJS Controllers/Services for strict CRUD. | Phase 1.1 | - | - | - |
| Invoices API | ✅ Complete | Advanced creation endpoints utilizing interactive Prisma `$transaction` wrappers for nested `InvoiceItems`. | Customers & Products | - | - | - |
| Validation Pipes | ✅ Complete | Complete Zod/class-validator DTOs bound globally. | Core APIs | - | - | - |
| PDF Generation | ✅ Complete | Uses `pdfkit` locally and persists securely to Supabase Storage (`pdfStorageKey`). | Invoices API | - | - | - |

### # Phase 1.3 — Dashboard
| Module | Status | Verified State | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | -------------- | ------------ | ---------- | ---- | --------------- |
| Dashboard APIs | ✅ Complete | `/dashboard/summary`, `/dashboard/monthly-revenue`, `/dashboard/recent-invoices` exist and aggregate securely at the DB level. | Phase 1.2 APIs | - | - | - |
| Dynamic UI Components | ✅ Complete | Next.js views (`DashboardOverview.tsx`) are actively consuming the optimized backend `/dashboard` endpoints. | Dashboard APIs | - | - | - |

### # Phase 1.4 — WhatsApp Layer
| Module | Status | Verified State | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | -------------- | ------------ | ---------- | ---- | --------------- |
| Webhook Handlers | ✅ Complete | Secure webhook endpoints exist in the `whatsapp` module. | Phase 1.1 | - | - | - |
| Session Management | ✅ Complete | `ConversationSession` and `ConversationMessage` schemas mapped in PostgreSQL to track multi-step conversational states securely. | Webhook Handlers | - | - | - |
| Human Approval Queue | ✅ Complete | Fully featured `PendingApproval` tracking system built to pause uncertain inputs. | Invoices API | - | - | - |
| Deduplication | ✅ Complete | Provider Message ID hashing and idempotency checks prevent double-processing. | Webhook Handlers | - | - | - |

---

> [!IMPORTANT]
> **We are currently stopping after Phase 1.4.** The sections below reflect the remaining unbuilt features required to take VyapaarAI to complete production maturity.

### # Phase 1.5 — AI Layer
| Module | Status | Missing Work | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | ------------ | ------------ | ---------- | ---- | --------------- |
| AI Provider Abstraction | ❌ Not Implemented | Generic service mapping to OpenAI/Anthropic/Gemini SDKs. | None | Small (<1 day) | Low | 1 |
| Message Parser | ❌ Not Implemented | Prompt structures and extraction models to convert Hindi/English unstructured text/audio into structured `Invoice` JSON DTOs. | AI Abstraction | Large (1–2 weeks) | High | 2 |
| Confidence Scores | ❌ Not Implemented | Logic determining if parsed data auto-files or is routed to the `PendingApproval` human-in-the-loop queue. | Message Parser | Small (<1 day) | Critical | 3 |

### # Phase 1.6 — GST Compliance
| Module | Status | Missing Work | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | ------------ | ------------ | ---------- | ---- | --------------- |
| GSTN Auth & Tokens | ❌ Not Implemented | Connect to GSTN sandbox, handle strict 6-hour token refresh lifecycles securely. | None | Large (1–2 weeks) | Critical | 4 |
| Rate Limiting & Retries | ❌ Not Implemented | Intelligent queueing logic (Redis/BullMQ) to respect governmental GSTN API limits. | GSTN Auth | Medium (1–3 days) | High | 5 |
| HSN/SAC Classifier | ❌ Not Implemented | AI mechanism/lookup table to query correct tax rates based on raw product names. | AI Layer | Medium (1–3 days) | High | 6 |

### # Phase 1.7 — E-Invoice
| Module | Status | Missing Work | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | ------------ | ------------ | ---------- | ---- | --------------- |
| IRN Generation | ❌ Not Implemented | Payload mapping to NIC IRP standards, hashing, and automated government submission. | GSTN Auth | Large (1–2 weeks) | Critical | 7 |
| QR Code Processing | ❌ Not Implemented | Extracting signed QR data from IRP and embedding it seamlessly into the existing `pdfkit` Generator. | IRN Generation | Medium (1–3 days) | Low | 8 |
| Cancellations/Amendments | ❌ Not Implemented | Robust temporal flows to cancel an IRN strictly within the 24-hour governmental window. | IRN Generation | Medium (1–3 days) | High | 9 |

### # Phase 1.8 — Reconciliation
| Module | Status | Missing Work | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | ------------ | ------------ | ---------- | ---- | --------------- |
| Purchase Register | ❌ Not Implemented | Schema additions to track vendor invoices securely against the organization. | Phase 1.1 | Medium (1–3 days) | Low | 10 |
| 2A/2B Comparison | ❌ Not Implemented | Pulling bulk JSON from GSTN and performing differential comparisons against the local Purchase Register line-by-line. | GSTN Auth | Very Large (>2 weeks)| Critical | 11 |
| Mismatch Detection | ❌ Not Implemented | Identifying and flagging missing ITC, duplicate entries, or rate mismatches. | 2A/2B Comparison | Large (1–2 weeks) | High | 12 |

### # Phase 1.9 — Observability & Security (Beyond Base Layers)
| Module | Status | Missing Work | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | ------------ | ------------ | ---------- | ---- | --------------- |
| Sentry & Error Filters | 🟡 Partially Implemented | Global `HttpExceptionFilter` exists but lacks external reporting hookups (e.g., Sentry). | None | Small (<1 day) | Medium | 13 |
| Rate Limiting | ❌ Not Implemented | Add `@nestjs/throttler` logic to prevent DDOS on webhook and external auth endpoints. | None | Small (<1 day) | Medium | 14 |

### # Phase 1.10 — Testing Maturity
| Module | Status | Missing Work | Dependencies | Complexity | Risk | Suggested Order |
| ------ | ------ | ------------ | ------------ | ---------- | ---- | --------------- |
| E2E Test Suite | ❌ Not Implemented | Expand beyond `tenant-isolation.spec.ts` into a complete `apps/api/test` suite covering core end-to-end flows. | Everything | Large (1-2 weeks)| Critical | 15 |

---

## Top 10 Highest Priority Missing Tasks (Phase 2 & Beyond)

1. **AI Parsing Infrastructure:** Establish the core pipeline converting raw user messages (WhatsApp) to DTOs.
2. **AI Confidence & Approvals:** Route ambiguous AI interpretations to the existing Human Approval queue to prevent automated tax fraud.
3. **GSTN Sandbox Auth:** Develop the persistent 6-hour token lifecycle management layer necessary to talk to the government.
4. **NIC IRP Payload Mapping:** Strictly map the VyapaarAI Invoice schema to the rigid governmental e-Invoice JSON specs.
5. **E-Invoice Submission Flow:** Submit, retry, and capture the IRN returned from the government portal.
6. **QR Code Injection:** Embed the cryptographic signature returned by the government directly into the generated PDFs.
7. **24hr Cancellation Chron:** Implement chron-jobs monitoring cancellation requests to ensure they do not breach the 24-hour limit.
8. **Purchase Ledger Schema:** Expand the Prisma schema to start ingesting inbound vendor invoices.
9. **GST 2A/2B Aggregation:** Fetch and normalize external GST reports against local databases for reconciliation.
10. **External Error Reporting:** Hook critical systems up to Sentry or Datadog to capture real-time production exceptions.

## Top 10 Technical Risks Moving Forward

1. **AI Hallucinations (Critical):** Auto-filing taxes based on LLM outputs without human verification invites severe legal/compliance risks. *Mitigation: Strict routing through the Approval Queue.*
2. **GSTN Rate Limits (High):** Reaching API limits results in sudden IP blocks from the government portal. *Mitigation: Implement BullMQ rate-limiting.*
3. **Token Lifecycles (High):** GSTN tokens expire quickly. Missing automatic refresh handling will randomly fail user filings. *Mitigation: Distributed Redis locking for refresh intervals.*
4. **Cancellation Windows (High):** E-Invoices can only be cancelled within 24 hours. *Mitigation: Scheduled jobs verifying timestamps.*
5. **Rounding Precision (Medium):** We utilize `Decimal` in Prisma, but rigorous rounding (off-by-cent) validations must be enforced at the API layer to avoid NIC IRP rejections.
6. **Webhook Retries (High):** WhatsApp resends webhooks if your server takes too long (>3s). *Mitigation: Idempotency is implemented, but AI latency must be managed carefully.*
7. **Stateless Conversions (Medium):** WhatsApp requires state. Attempting to parse an invoice in a single zero-shot prompt instead of utilizing our `ConversationSession` context will result in a poor UX.
8. **Test Absence (Critical):** Deep financial integrations currently lack robust automated E2E test suites.
9. **Soft Delete Bugs (Medium):** `deletedAt` exists, but without strict application logic, deleted data could erroneously appear in tax reports.
10. **HSN/SAC Lookups (Medium):** AI may categorize items incorrectly. The fallback UI must explicitly require users to verify HSN categorizations.

## Estimated Remaining Work (Weeks)
To advance VyapaarAI from the solid Phase 1.4 foundation to a production-ready, fully compliant state:
* **Phase 1.5 (AI Layer):** ~2 weeks
* **Phase 1.6 & 1.7 (GSTN & E-Invoice):** ~3 weeks
* **Phase 1.8 (Reconciliation):** ~2.5 weeks
* **Observability & Testing Polish:** ~1.5 weeks
* **Total Estimate:** **~9 Weeks** (for a dedicated senior engineering pod).

## Suggested Next Sprint (Phase 1.5 - AI Layer)
**Focus entirely on ingesting and comprehending data.**
1. Implement standard OpenAI/Anthropic service abstractions.
2. Build the parsing engine capable of receiving informal text/voice from the WhatsApp webhook handlers and converting it into structured `CreateInvoiceDto` objects.
3. Hook up the confidence scorer: if Confidence > 95%, execute creation. If < 95%, push the `CreateInvoiceDto` into the `PendingApproval` ledger for user verification on the Dashboard.
