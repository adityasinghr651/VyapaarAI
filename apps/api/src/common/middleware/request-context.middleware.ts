import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ): void {
    const requestId = this.headerValue(request.headers['x-request-id']);
    const traceId = this.headerValue(request.headers['x-trace-id']);

    request.requestId = requestId ?? randomUUID();
    request.traceId = traceId ?? request.requestId;
    response.setHeader('x-request-id', request.requestId);
    response.setHeader('x-trace-id', request.traceId);
    next();
  }

  private headerValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }
}
