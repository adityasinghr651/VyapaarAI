import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  public client: any;

  constructor() {
    this.prisma = new PrismaClient();
    const self = this.prisma;
    
    this.client = this.prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: { model: string; operation: string; args: any; query: (args: any) => Promise<any> }) {
            const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
            const softDeleteModels = ['Customer', 'Product', 'Invoice'];
            
            if (softDeleteModels.includes(model)) {
              if (operation === 'delete') {
                return (self as any)[modelKey].update({
                  where: args.where,
                  data: { deletedAt: new Date() },
                });
              }
              
              if (operation === 'deleteMany') {
                return (self as any)[modelKey].updateMany({
                  where: args.where,
                  data: { deletedAt: new Date() },
                });
              }
              
              if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
                const newOperation = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
                return (self as any)[modelKey][newOperation]({
                  ...args,
                  where: {
                    ...args.where,
                    deletedAt: null,
                  },
                });
              }
              
              if (operation.startsWith('find') || operation === 'count') {
                if (!args.where) {
                  args.where = {};
                }
                if (args.where.deletedAt === undefined) {
                  args.where.deletedAt = null;
                }
              }
            }
            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
