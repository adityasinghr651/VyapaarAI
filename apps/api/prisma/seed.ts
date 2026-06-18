import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Owner User
  const ownerEmail = 'owner@vyapaarai.com';
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  let owner: any;
  if (!existingOwner) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('DevOwner123!', salt);
    owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        password: hashedPassword,
        name: 'Dev Owner User',
        role: 'OWNER',
      },
    });
    console.log(`✅ Created OWNER account: ${ownerEmail} (password: DevOwner123!)`);
  } else {
    owner = existingOwner;
    console.log(`ℹ️ OWNER account already exists: ${ownerEmail}`);
  }

  // 2. Seed Sample Customer
  const customerEmail = 'billing@acme.com';
  const existingCustomer = await prisma.customer.findFirst({
    where: { name: 'ACME Corp' },
  });

  let customer: any;
  if (!existingCustomer) {
    customer = await prisma.customer.create({
      data: {
        name: 'ACME Corp',
        email: customerEmail,
        phone: '+919999999999',
        address: '123 Business Park, Sector 62, Noida, UP, India',
        gstin: '09AAACA1111A1Z1',
      },
    });
    console.log(`✅ Created Sample Customer: ${customer.name}`);
  } else {
    customer = existingCustomer;
    console.log(`ℹ️ Sample Customer already exists: ${customer.name}`);
  }

  // 3. Seed Sample Product
  const existingProduct = await prisma.product.findUnique({
    where: { sku: 'PROD-LAPTOP-01' },
  });

  let product: any;
  if (!existingProduct) {
    product = await prisma.product.create({
      data: {
        name: 'Enterprise Developer Laptop',
        description: 'High performance computer for software developers',
        sku: 'PROD-LAPTOP-01',
        price: 85000.0,
        gstRate: 18.0,
      },
    });
    console.log(`✅ Created Sample Product: ${product.name} (Price: INR 85,000 + 18% GST)`);
  } else {
    product = existingProduct;
    console.log(`ℹ️ Sample Product already exists: ${product.name}`);
  }

  console.log('🌱 Seeding process complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
