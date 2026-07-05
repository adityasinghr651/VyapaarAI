import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from './config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Request-Id, X-Trace-Id',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = config.get('PORT');
  await app.listen(port);
}

void bootstrap();
