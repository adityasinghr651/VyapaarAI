import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrisma: any = {
      client: {
        customer: {
          findUnique: jest.fn(),
        },
        invoice: {
          create: jest.fn(),
          findUnique: jest.fn(),
        },
        $transaction: jest.fn((cb) => cb(mockPrisma.client)),
        product: {
          findUnique: jest.fn(),
        },
        invoiceSequence: {
          upsert: jest.fn(),
        },
      },
    };

    const mockAudit = {
      log: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should calculate totals correctly using Decimal', async () => {
    prismaService.client.customer.findUnique.mockResolvedValue({ id: 'cust-1', name: 'Acme Corp' });
    prismaService.client.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      name: 'Product A',
      price: new Decimal('100.00'),
      gstRate: new Decimal('18.00'),
    });
    prismaService.client.invoiceSequence.upsert.mockResolvedValue({ year: 2026, sequence: 5 });
    
    prismaService.client.invoice.create.mockImplementation(({ data }: any) => ({
      id: 'inv-1',
      invoiceNumber: data.invoiceNumber,
      subtotal: data.subtotal,
      gstAmount: data.gstAmount,
      total: data.total,
    }));

    const result = await service.create({
      customerId: 'cust-1',
      items: [
        { productId: 'prod-1', quantity: 2 },
      ],
    }, 'actor-1');

    expect(prismaService.client.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    expect(result.invoiceNumber).toBe('INV-2026-0005');
    expect(result.subtotal.toString()).toBe('200');
    expect(result.gstAmount.toString()).toBe('36');
    expect(result.total.toString()).toBe('236');
  });
});
