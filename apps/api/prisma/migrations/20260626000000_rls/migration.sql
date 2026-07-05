-- Enable Row Level Security on tenant-bound tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice_sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pending_approvals" ENABLE ROW LEVEL SECURITY;

-- Create policies enforcing tenant isolation
CREATE POLICY "Tenant Isolation" ON "users" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "customers" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "products" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "invoices" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "invoice_items" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "audit_logs" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "invoice_sequences" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "conversation_sessions" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "conversation_messages" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
CREATE POLICY "Tenant Isolation" ON "pending_approvals" FOR ALL USING ("tenantId" = current_setting('app.current_tenant_id', true));
