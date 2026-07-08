import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, ApiValidationError } from '@vyapaarai/shared-types';
import { AuthenticatedRequest } from '../types/authenticated-request';

interface HttpErrorBody {
  message?: string | string[];
  errors?: ApiValidationError[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<AuthenticatedRequest>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = this.toSafeResponse(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({
        message: 'Unhandled request error',
        requestId: request.requestId,
        traceId: request.traceId,
        tenantId: request.user?.tenantId,
        path: request.originalUrl,
        error: exception instanceof Error ? exception.stack : String(exception),
      });
    }

    const body: ApiResponse<never> = {
      success: false,
      message: details.message,
      ...(details.errors ? { errors: details.errors } : {}),
    };
    response.status(status).json(body);
  }

  private toSafeResponse(
    exception: unknown,
    status: number,
  ): { message: string; errors?: ApiValidationError[] } {
    if (!(exception instanceof HttpException)) {
      return { message: 'Internal server error' };
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return { message: body };
    }

    const errorBody = body as HttpErrorBody;
    if (Array.isArray(errorBody.message)) {
      return {
        message: 'Validation failed',
        errors: errorBody.message.map((message) => ({
          field: message.split(' ')[0] ?? 'input',
          message,
        })),
      };
    }

    return {
      message:
        errorBody.message ??
        (status >= 500 ? 'Internal server error' : 'Request failed'),
      errors: errorBody.errors,
    };
  }
}
