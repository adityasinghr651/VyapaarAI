import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AuthMode, SupabaseContext } from '@supabase/server';

export const AUTH_MODE_KEY = 'supabaseAuthMode';

/**
 * Configure the AuthMode for the route (e.g. 'user', 'publishable', 'secret', 'none').
 * Used by the SupabaseGuard to initialize the context.
 */
export const SupabaseAuth = (mode: AuthMode) => SetMetadata(AUTH_MODE_KEY, mode);

/**
 * Extracts the initialized SupabaseContext from the request object.
 * Must be used in conjunction with the SupabaseGuard.
 */
export const SupabaseCtx = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SupabaseContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.supabaseCtx;
  },
);
