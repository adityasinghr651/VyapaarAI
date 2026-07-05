import { GstTaxType, Prisma } from '@prisma/client';
import { InvoiceCalculationService } from './invoice-calculation.service';

describe('InvoiceCalculationService', () => {
  const service = new InvoiceCalculationService();
  const product = {
    id: 'product-1',
    name: 'Consulting',
    description: null,
    hsnCode: '998311',
    price: new Prisma.Decimal('100.00'),
    gstRate: new Prisma.Decimal('18.00'),
    quantity: 2,
  };

  it('calculates intra-state CGST and SGST', () => {
    const result = service.calculate([product], '09', '09');

    expect(result.taxType).toBe(GstTaxType.INTRA_STATE);
    expect(result.subtotal.toFixed(2)).toBe('200.00');
    expect(result.cgstAmount.toFixed(2)).toBe('18.00');
    expect(result.sgstAmount.toFixed(2)).toBe('18.00');
    expect(result.igstAmount.toFixed(2)).toBe('0.00');
    expect(result.total.toFixed(2)).toBe('236.00');
  });

  it('calculates inter-state IGST', () => {
    const result = service.calculate([product], '09', '27');

    expect(result.taxType).toBe(GstTaxType.INTER_STATE);
    expect(result.igstAmount.toFixed(2)).toBe('36.00');
    expect(result.cgstAmount.toFixed(2)).toBe('0.00');
    expect(result.sgstAmount.toFixed(2)).toBe('0.00');
  });
});
