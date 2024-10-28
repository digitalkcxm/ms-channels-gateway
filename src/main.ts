import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';
import { EnvVars } from './config/env-vars';

async function bootstrap() {
  console.log('process.env', process.env);
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use(compression());

  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const configService = app.get(ConfigService<EnvVars>);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = configService.get<number>('PORT', 80);

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
