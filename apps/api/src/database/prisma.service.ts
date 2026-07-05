import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  rls(tenantId: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const prisma = this;
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }
}
