export enum Role {
  OWNER = 'OWNER',
  ACCOUNTANT = 'ACCOUNTANT',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface ApiResponse<T = any> {
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
  details: Record<string, any>;
  createdAt: string;
}
