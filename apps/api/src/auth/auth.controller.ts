import { Body, Controller, Get, Headers, Ip, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return {
      message: 'Registration successful',
      data: await this.authService.register(dto),
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      message: 'Login successful',
      data: await this.authService.login(
        dto,
        ip,
        userAgent,
        request.requestId,
        request.traceId,
      ),
    };
  }

  @Get('me')
  async me(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: 'Current user profile fetched successfully',
      data: await this.authService.getCurrentUser(userId, tenantId),
    };
  }
}
