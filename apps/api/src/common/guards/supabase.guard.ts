import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createSupabaseContext, AuthMode } from '@supabase/server';
import { AUTH_MODE_KEY } from '../decorators/supabase.decorator';

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMode = this.reflector.getAllAndOverride<AuthMode>(AUTH_MODE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || 'user'; // default to 'user' auth if not specified

    const req = context.switchToHttp().getRequest();

    // Map Express Request headers to Web API Headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value) {
        headers.set(key, value as string);
      }
    }

    // Construct a standard Request object for @supabase/server
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost';
    const url = `${protocol}://${host}${req.originalUrl || req.url}`;
    const webRequest = new Request(url, {
      method: req.method,
      headers,
    });

    // Create the Supabase context
    const { data: supabaseCtx, error } = await createSupabaseContext(webRequest, {
      auth: authMode,
    });

    if (error) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }

    // Attach to the Express request
    req.supabaseCtx = supabaseCtx;

    return true;
  }
}
