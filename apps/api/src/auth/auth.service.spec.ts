import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let auditService: any;

  beforeEach(async () => {
    const mockPrisma = {
      client: {
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      },
    };

    const mockJwt = {
      signAsync: jest.fn().mockResolvedValue('test-jwt-token'),
    };

    const mockAudit = {
      log: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and return a token', async () => {
      prismaService.client.user.findUnique.mockResolvedValue(null);
      prismaService.client.user.create.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ACCOUNTANT',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(prismaService.client.user.findUnique).toHaveBeenCalled();
      expect(prismaService.client.user.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith('USER_REGISTER', '123', expect.any(Object));
      expect(result.token).toBe('test-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
