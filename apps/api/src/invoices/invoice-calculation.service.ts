import { Injectable } from '@nestjs/common';
import { GstTaxType, Prisma } from '@prisma/client';

export interface InvoiceProductInput {
  id: string;
  name: string;
  description: string | null;
  hsnCode: string | null;
  price: Prisma.Decimal;
  gstRate: Prisma.Decimal;
  quantity: number;
}

export interface CalculatedInvoiceItem {
  productId: string;
  productName: string;
  description: string | null;
  hsnCode: string | null;
  quantity: number;
  price: Prisma.Decimal;
  gstRate: Prisma.Decimal;
  gstAmount: Prisma.Decimal;
  total: Prisma.Decimal;
}

export interface InvoiceCalculation {
  subtotal: Prisma.Decimal;
  gstAmount: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  total: Prisma.Decimal;
  taxType: GstTaxType;
  items: CalculatedInvoiceItem[];
}

@Injectable()
export class InvoiceCalculationService {
  calculate(
    products: InvoiceProductInput[],
    sellerStateCode: string | null,
    customerStateCode: string | null,
  ): InvoiceCalculation {
    const taxType =
      sellerStateCode &&
      customerStateCode &&
      sellerStateCode !== customerStateCode
        ? GstTaxType.INTER_STATE
        : GstTaxType.INTRA_STATE;

    const items = products.map((product) => this.calculateItem(product));
    const subtotal = this.sum(items.map((item) => item.price.mul(item.quantity)));
    const gstAmount = this.sum(items.map((item) => item.gstAmount));
    const total = subtotal.add(gstAmount).toDecimalPlaces(2);
    const igstAmount =
      taxType === GstTaxType.INTER_STATE ? gstAmount : new Prisma.Decimal(0);
    const cgstAmount =
      taxType === GstTaxType.INTRA_STATE
        ? gstAmount.div(2).toDecimalPlaces(2)
        : new Prisma.Decimal(0);
    const sgstAmount =
      taxType === GstTaxType.INTRA_STATE
        ? gstAmount.sub(cgstAmount).toDecimalPlaces(2)
        : new Prisma.Decimal(0);

    return {
      subtotal,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total,
      taxType,
      items,
    };
  }

  private calculateItem(product: InvoiceProductInput): CalculatedInvoiceItem {
    const taxableAmount = product.price
      .mul(product.quantity)
      .toDecimalPlaces(2);
    const gstAmount = taxableAmount
      .mul(product.gstRate)
      .div(100)
      .toDecimalPlaces(2);

    return {
      productId: product.id,
      productName: product.name,
      description: product.description,
      hsnCode: product.hsnCode,
      quantity: product.quantity,
      price: product.price,
      gstRate: product.gstRate,
      gstAmount,
      total: taxableAmount.add(gstAmount).toDecimalPlaces(2),
    };
  }

  private sum(values: Prisma.Decimal[]): Prisma.Decimal {
    return values
      .reduce(
        (total, value) => total.add(value),
        new Prisma.Decimal(0),
      )
      .toDecimalPlaces(2);
  }
}
