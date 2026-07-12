import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AiParserService } from './ai/ai-parser.service';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  console.log('Bootstrapping NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const prisma = app.get(PrismaService);
  const parser = app.get(AiParserService);

  try {
    // 1. Ensure a test organization, user, customer, and product exist
    console.log('Setting up seed context for testing...');
    const org = await prisma.organization.upsert({
      where: { slug: 'test-ai-org' },
      update: {},
      create: {
        name: 'Test AI Org',
        slug: 'test-ai-org',
        whatsappPhoneNumberId: '1234567890',
      },
    });

    await prisma.user.upsert({
      where: { email: 'ai-owner@test.com' },
      update: {},
      create: {
        tenantId: org.id,
        email: 'ai-owner@test.com',
        name: 'AI Test Owner',
        password: 'password123', // dummy password hash placeholder
        role: 'OWNER',
      },
    });

    await prisma.customer.upsert({
      where: { id: 'test-cust-id-1' },
      update: {},
      create: {
        id: 'test-cust-id-1',
        tenantId: org.id,
        name: 'Rahul Traders',
        phone: '+919999988888',
      },
    });

    await prisma.product.upsert({
      where: { tenantId_sku: { tenantId: org.id, sku: 'CEMENT-50KG' } },
      update: {},
      create: {
        tenantId: org.id,
        name: 'ACC Cement 50kg',
        sku: 'CEMENT-50KG',
        price: 450.00,
        gstRate: 18.00,
      },
    });

    console.log('Testing AI text parsing...');
    const message = 'Rahul Traders ko 10 bag ACC Cement becho at 440 each';
    console.log(`Input message: "${message}"`);
    
    const parsed = await parser.parseMessage(message, org.id);
    console.log('\nAI PARSED RESULT:');
    console.log(JSON.stringify(parsed, null, 2));

  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
