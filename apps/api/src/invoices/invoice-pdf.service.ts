import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import PDFDocument = require('pdfkit');
import { AuditService } from '../audit/audit.service';
import { NotFoundError } from '../common/errors/application.errors';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';

type InvoicePdfRecord = Prisma.InvoiceGetPayload<{
  include: {
    customer: true;
    items: true;
    tenant: true;
  };
}>;

@Injectable()
export class InvoicePdfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly auditService: AuditService,
  ) {}

  async generate(invoiceId: string, tenantId: string, actorId: string) {
    const invoice = await this.loadInvoice(invoiceId, tenantId);
    const buffer = await this.render(invoice);
    const storageKey = `${tenantId}/${invoice.invoiceNumber}.pdf`;
    const checksum = createHash('sha256').update(buffer).digest('hex');

    await this.storage.put(storageKey, buffer);
    await this.prisma.$transaction(async (transaction) => {
      await transaction.invoice.update({
        where: { id: invoiceId },
        data: {
          pdfStorageKey: storageKey,
          pdfChecksum: checksum,
          pdfGeneratedAt: new Date(),
        },
      });
      await this.auditService.log(
        {
          tenantId,
          actorId,
          action: 'INVOICE_PDF_GENERATED',
          entityType: 'Invoice',
          entityId: invoiceId,
          metadata: { storageKey, checksum },
        },
        transaction,
      );
    });
    return { storageKey, checksum, size: buffer.length };
  }

  async get(invoiceId: string, tenantId: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId, deletedAt: null },
      select: { pdfStorageKey: true },
    });
    if (!invoice?.pdfStorageKey) {
      throw new NotFoundError('Invoice PDF');
    }
    return this.storage.get(invoice.pdfStorageKey);
  }

  private async loadInvoice(
    invoiceId: string,
    tenantId: string,
  ): Promise<InvoicePdfRecord> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId, deletedAt: null },
      include: { customer: true, items: true, tenant: true },
    });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }
    return invoice;
  }

  private render(invoice: InvoicePdfRecord): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      this.drawHeader(document, invoice);
      this.drawParties(document, invoice);
      this.drawItems(document, invoice);
      this.drawTotals(document, invoice);
      document.end();
    });
  }

  private drawHeader(document: PDFKit.PDFDocument, invoice: InvoicePdfRecord) {
    document.fontSize(20).text('TAX INVOICE', { align: 'center' });
    document.moveDown();
    document.fontSize(12).text(invoice.tenant.name);
    document.fontSize(9).text(invoice.tenant.address ?? '');
    document.text(`GSTIN: ${invoice.tenant.gstin ?? 'Unregistered'}`);
    document.text(`Invoice: ${invoice.invoiceNumber}`, 390, 80);
    document.text(`Date: ${invoice.issueDate.toLocaleDateString('en-IN')}`, 390);
    if (invoice.dueDate) {
      document.text(`Due: ${invoice.dueDate.toLocaleDateString('en-IN')}`, 390);
    }
  }

  private drawParties(document: PDFKit.PDFDocument, invoice: InvoicePdfRecord) {
    document.moveDown(2);
    document.fontSize(11).text('Bill To', { underline: true });
    document.fontSize(9).text(invoice.customer.name);
    document.text(invoice.customer.address ?? '');
    document.text(`GSTIN: ${invoice.customer.gstin ?? 'Unregistered'}`);
    document.text(`State code: ${invoice.customer.stateCode ?? '-'}`);
    document.moveDown();
  }

  private drawItems(document: PDFKit.PDFDocument, invoice: InvoicePdfRecord) {
    const columns = [40, 220, 290, 340, 405, 475];
    document.fontSize(8).font('Helvetica-Bold');
    ['Item', 'HSN', 'Qty', 'Rate', 'GST', 'Amount'].forEach((label, index) => {
      document.text(label, columns[index], document.y, {
        width: index === 0 ? 170 : 65,
      });
    });
    document.moveDown().font('Helvetica');

    for (const item of invoice.items) {
      const rowY = document.y;
      document.text(item.productName, columns[0], rowY, { width: 170 });
      document.text(item.hsnCode ?? '-', columns[1], rowY, { width: 60 });
      document.text(String(item.quantity), columns[2], rowY, { width: 40 });
      document.text(this.money(item.price), columns[3], rowY, { width: 60 });
      document.text(`${item.gstRate.toString()}%`, columns[4], rowY, {
        width: 55,
      });
      document.text(this.money(item.total), columns[5], rowY, { width: 75 });
      document.moveDown(1.5);
    }
    document.moveDown();
  }

  private drawTotals(document: PDFKit.PDFDocument, invoice: InvoicePdfRecord) {
    const x = 360;
    document.fontSize(9).text(`Subtotal: ${this.money(invoice.subtotal)}`, x);
    if (invoice.taxType === 'INTRA_STATE') {
      document.text(`CGST: ${this.money(invoice.cgstAmount)}`, x);
      document.text(`SGST: ${this.money(invoice.sgstAmount)}`, x);
    } else {
      document.text(`IGST: ${this.money(invoice.igstAmount)}`, x);
    }
    document
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`Total: ${this.money(invoice.total)}`, x);
    document.font('Helvetica').fontSize(8).moveDown(2);
    document.text('This is a computer-generated invoice.');
  }

  private money(value: Prisma.Decimal): string {
    return `INR ${value.toFixed(2)}`;
  }
}
