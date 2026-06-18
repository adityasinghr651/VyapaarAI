import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@vyapaarai/shared-types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resMessage = (exceptionResponse as any).message;
        if (Array.isArray(resMessage)) {
          message = 'Validation failed';
          errors = resMessage.map((msg: string) => {
            const words = msg.split(' ');
            return {
              field: words[0] || 'input',
              message: msg,
            };
          });
        } else {
          message = resMessage || 'Http Exception';
        }
        
        if ((exceptionResponse as any).errors) {
          errors = (exceptionResponse as any).errors;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const apiResponse: ApiResponse = {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    };

    response.status(status).json(apiResponse);
  }
}
