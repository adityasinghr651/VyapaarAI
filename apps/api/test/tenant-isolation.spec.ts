import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Database RLS', () => {
    it('should prevent access to other tenants data at the database level', async () => {
      // Create test tenants
      const tenantA = await prisma.organization.create({
        data: { name: 'Tenant A', slug: 'tenant-a-' + Date.now() },
      });
      const tenantB = await prisma.organization.create({
        data: { name: 'Tenant B', slug: 'tenant-b-' + Date.now() },
      });

      // Create data for tenant A
      const customerA = await prisma.customer.create({
        data: { name: 'Customer A', tenantId: tenantA.id },
      });

      // Use RLS client for tenant B
      const rlsClientB = prisma.rls(tenantB.id);

      // Attempt to read tenant A's data using tenant B's context
      const foundCustomer = await rlsClientB.customer.findFirst({
        where: { id: customerA.id },
      });

      // Cleanup
      await prisma.customer.delete({ where: { id: customerA.id } });
      await prisma.organization.delete({ where: { id: tenantA.id } });
      await prisma.organization.delete({ where: { id: tenantB.id } });

      // If RLS is working, foundCustomer should be null because the DB drops the row
      expect(foundCustomer).toBeNull();
    });
  });
});
