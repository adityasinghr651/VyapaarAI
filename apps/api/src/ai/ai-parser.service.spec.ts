import { Test, TestingModule } from '@nestjs/testing';
import { AiParserService } from './ai-parser.service';
import { PrismaService } from '../database/prisma.service';
import { AiService } from './ai.service';
import { ParsedInvoiceDto } from './dto/parsed-invoice.dto';

describe('AiParserService', () => {
  let service: AiParserService;
  let mockPrisma: any;
  let mockAiService: any;

  beforeEach(async () => {
    mockPrisma = {
      customer: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'cust-1', name: 'Ramesh Kumar', phone: '9999999999', gstin: 'ABC1234' },
        ]),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'prod-1', name: 'Dell Laptop', sku: 'DELL-123', price: 50000, hsnCode: '8471' },
        ]),
      },
    };

    mockAiService = {
      parseStructured: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiParserService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<AiParserService>(AiParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseMessage', () => {
    it('should query existing database context and pass it to AiService', async () => {
      const mockParsedOutput: ParsedInvoiceDto = {
        customer: { name: 'Ramesh Kumar' },
        items: [{ productName: 'Dell Laptop', quantity: 2, price: 50000 }],
        confidence: 0.95,
        reasoning: 'Extracted clear instruction',
        rawSummary: 'Ramesh ordered 2 Dell Laptops.',
      };
      
      mockAiService.parseStructured.mockResolvedValue(mockParsedOutput);

      const result = await service.parseMessage(
        'Ramesh ko 2 laptop becha',
        'tenant-id-123',
      );

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-id-123', deletedAt: null },
        select: { id: true, name: true, phone: true, gstin: true },
      });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-id-123', deletedAt: null },
        select: { id: true, name: true, sku: true, price: true, hsnCode: true },
      });
      expect(mockAiService.parseStructured).toHaveBeenCalled();
      expect(result).toEqual(mockParsedOutput);
    });
  });
});
