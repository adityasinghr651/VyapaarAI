import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ParsedCustomerDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gstin?: string;
}

export class ParsedInvoiceItemDto {
  @IsString()
  productName!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class ParsedInvoiceDto {
  @ValidateNested()
  @Type(() => ParsedCustomerDto)
  customer!: ParsedCustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParsedInvoiceItemDto)
  items!: ParsedInvoiceItemDto[];

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number;

  @IsOptional()
  @IsString()
  reasoning?: string;

  @IsOptional()
  @IsString()
  rawSummary?: string;
}

// Zod schema for structured output validation / Gemini schema mode
export const parsedInvoiceZodSchema = {
  type: 'object',
  properties: {
    customer: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Fuzzy matched customer name' },
        phone: { type: 'string', description: 'Customer phone number if found' },
        gstin: { type: 'string', description: 'Customer GSTIN details if specified' },
      },
      required: ['name'],
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Fuzzy matched product name' },
          quantity: { type: 'integer', description: 'Quantity of items purchased' },
          price: { type: 'number', description: 'Unit price of the product if specified' },
        },
        required: ['productName', 'quantity'],
      },
    },
    confidence: {
      type: 'number',
      description: 'Overall confidence score between 0.0 (no confidence) and 1.0 (highly confident)',
    },
    reasoning: {
      type: 'string',
      description: 'Short explanation of the parsing, indicating any missing data or assumptions made',
    },
    rawSummary: {
      type: 'string',
      description: 'A summary paragraph summarizing the conversation details',
    },
  },
  required: ['customer', 'items', 'confidence'],
};
