import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuth, SupabaseCtx } from './common/decorators/supabase.decorator';
import { SupabaseGuard } from './common/guards/supabase.guard';
import { SupabaseContext } from '@supabase/server';

@Controller('test-supabase')
@UseGuards(SupabaseGuard)
export class TestSupabaseController {
  
  // Example 1: Endpoint requiring valid JWT user auth
  @Get('user')
  @SupabaseAuth('user')
  async testUserAuth(@SupabaseCtx() ctx: SupabaseContext) {
    return {
      message: 'Authenticated as user successfully!',
      authMode: ctx.authMode, // 'user'
      userId: ctx.userClaims?.id,
    };
  }

  // Example 2: Endpoint requiring valid publishable key
  @Get('publishable')
  @SupabaseAuth('publishable')
  async testPublishableAuth(@SupabaseCtx() ctx: SupabaseContext) {
    return {
      message: 'Authenticated with publishable key successfully!',
      authMode: ctx.authMode, // 'publishable'
    };
  }

  // Example 3: Endpoint requiring NO auth (public endpoint)
  @Get('none')
  @SupabaseAuth('none')
  async testNoAuth(@SupabaseCtx() ctx: SupabaseContext) {
    // You can still use ctx.supabase or ctx.supabaseAdmin here
    return {
      message: 'Public endpoint executed successfully!',
      authMode: ctx.authMode, // 'none'
    };
  }
}
