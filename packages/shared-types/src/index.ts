export enum Role {
  OWNER = 'OWNER',
  ACCOUNTANT = 'ACCOUNTANT',
  STAFF = 'STAFF',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum ConversationDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum ConversationMessageStatus {
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiValidationError[];
}

export interface ApiValidationError {
  field: string;
  message: string;
}

export interface UserSessionDto {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface CustomerDto {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  price: string;
  gstRate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
  gstRate: string;
  gstAmount: string;
  total: string;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate?: string | null;
  subtotal: string;
  gstAmount: string;
  total: string;
  status: InvoiceStatus;
  items: InvoiceItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogDto {
  id: string;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface ConversationSessionDto {
  id: string;
  channel: string;
  externalContactId: string;
  contactName?: string | null;
  state: Record<string, unknown>;
  lastMessageAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessageDto {
  id: string;
  sessionId: string;
  providerMessageId: string;
  direction: ConversationDirection;
  status: ConversationMessageStatus;
  messageType: string;
  body?: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export interface PendingApprovalDto {
  id: string;
  workflowType: string;
  entityType: string;
  entityId?: string | null;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  requestedById: string;
  requestedByName?: string | null;
  decidedById?: string | null;
  decidedByName?: string | null;
  decisionNote?: string | null;
  expiresAt?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
