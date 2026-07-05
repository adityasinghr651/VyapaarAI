import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting database seeding...');

  const organization = await prisma.organization.upsert({
    where: { slug: 'vyapaarai-demo' },
    update: {},
    create: {
      name: 'VyapaarAI Demo',
      slug: 'vyapaarai-demo',
      email: 'billing@vyapaarai.com',
      address: 'Noida, Uttar Pradesh, India',
      stateCode: '09',
    },
  });

  const ownerEmail = 'owner@vyapaarai.com';
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (!existingOwner) {
    const hashedPassword = await bcrypt.hash('DevOwner123!', 10);
    await prisma.user.create({
      data: {
        tenantId: organization.id,
        email: ownerEmail,
        password: hashedPassword,
        name: 'Dev Owner User',
        role: 'OWNER',
      },
    });
    console.log(`Created OWNER account: ${ownerEmail}`);
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: { tenantId: organization.id, name: 'ACME Corp' },
  });

  if (!existingCustomer) {
    await prisma.customer.create({
      data: {
        tenantId: organization.id,
        name: 'ACME Corp',
        email: 'billing@acme.com',
        phone: '+919999999999',
        address: '123 Business Park, Sector 62, Noida, UP, India',
        gstin: '09AAACA1111A1Z1',
        stateCode: '09',
      },
    });
    console.log('Created sample customer');
  }

  const existingProduct = await prisma.product.findFirst({
    where: { tenantId: organization.id, sku: 'PROD-LAPTOP-01' },
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        tenantId: organization.id,
        name: 'Enterprise Developer Laptop',
        description: 'High performance computer for software developers',
        sku: 'PROD-LAPTOP-01',
        hsnCode: '84713010',
        price: 85000,
        gstRate: 18,
      },
    });
    console.log('Created sample product');
  }

  console.log('Seeding process complete');
}

main()
  .catch((error: unknown) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
