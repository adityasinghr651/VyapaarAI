import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from './ai.service';
import { ParsedInvoiceDto, parsedInvoiceZodSchema } from './dto/parsed-invoice.dto';

@Injectable()
export class AiParserService {
  private readonly logger = new Logger(AiParserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async parseMessage(
    text: string,
    tenantId: string,
  ): Promise<ParsedInvoiceDto> {
    const prompt = await this.buildPrompt(text, tenantId);
    return this.aiService.parseStructured<ParsedInvoiceDto>(
      prompt,
      parsedInvoiceZodSchema,
    );
  }

  async parseAudio(
    audioBuffer: Buffer,
    mimeType: string,
    tenantId: string,
  ): Promise<ParsedInvoiceDto> {
    const prompt = await this.buildPrompt(
      'Extract details from this voice note according to the instructions and guidelines.',
      tenantId,
    );
    return this.aiService.parseStructured<ParsedInvoiceDto>(
      prompt,
      parsedInvoiceZodSchema,
      { buffer: audioBuffer, mimeType },
    );
  }

  private async buildPrompt(inputText: string, tenantId: string): Promise<string> {
    // Retrieve customers and products for context mapping
    const customers = await this.prisma.customer.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, name: true, phone: true, gstin: true },
    });

    const products = await this.prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, name: true, sku: true, price: true, hsnCode: true },
    });

    const customersContext = customers
      .map((c) => `- "${c.name}" (phone: ${c.phone ?? 'N/A'}, GSTIN: ${c.gstin ?? 'N/A'})`)
      .join('\n');

    const productsContext = products
      .map((p) => `- "${p.name}" (sku: ${p.sku ?? 'N/A'}, price: ${p.price.toString()})`)
      .join('\n');

    return `
You are VyapaarAI's intelligent invoicing parser. Your task is to extract structured invoice information from unstructured user input.
The user input can be in English, Hindi (written in Devanagari), or Hinglish (Hindi written using the Roman script/English letters).

Here is the unstructured text/context:
"""
${inputText}
"""

Guidelines:
1. **Fuzzy Matching**:
   We have provided list of existing customers and products below. Try to match the customer name and product names to these lists.
   If a match is extremely close (e.g., "Ramesh" to "Ramesh Kumar" or "laptop" to "Dell Laptop"), use the matched names/entities.

2. **Customer Matching**:
   - If you find a match, extract the exact name of the customer.
   - If no match exists, output the name mentioned as is.

3. **Invoice Items**:
   - Parse each item mentioned. Match its name to the existing products list.
   - If a quantity is not explicitly mentioned (e.g., "Ramesh ko book becha"), assume quantity is 1.
   - If a price is explicitly mentioned in the text (e.g., "book at 300"), extract it.
   - If no price is mentioned, omit the price or leave it null, we will fetch it from our database.

4. **Confidence Scoring**:
   - Assign a confidence score between 0.0 (no confidence/irrelevant message) and 1.0 (perfectly clear).
   - Deduct confidence if details are missing, names are ambiguous, or if it is not an invoicing instruction.
   - If the message is not an invoice creation instruction (e.g., "hello", "how are you", "send report"), set confidence to 0.0.

5. **Hindi/Hinglish translations**:
   - "becha" / "diya" / "sell" means item was sold (invoice item).
   - "kharida" / "buy" refers to purchase (not sales invoice, reduce confidence or set items appropriately).
   - Numbers: "ek" = 1, "do" = 2, "teen" = 3, "chaar" = 4, "paanch" = 5, "das" = 10.

---
EXISTING CUSTOMERS:
${customersContext || '(None yet)'}

EXISTING PRODUCTS:
${productsContext || '(None yet)'}
---

Your response MUST be a single structured JSON object containing:
- customer: { name, phone, gstin }
- items: array of { productName, quantity, price }
- confidence: number (0.0 to 1.0)
- reasoning: brief reason for the extraction
- rawSummary: general summary description of the interaction
`;
  }
}
