import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@vyapaarai/shared-types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          return data;
        }
        
        let message = 'Operation completed successfully';
        let resultData = data;
        
        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          message = data.message;
          resultData = data.data;
        }

        return {
          success: true,
          message,
          data: resultData === undefined ? null : resultData,
        };
      }),
    );
  }
}
