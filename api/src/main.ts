import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { validationPipe } from './common/validation.js';
import { config } from './config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(validationPipe);
  app.enableCors();
  await app.listen(config.port);
}
await bootstrap();
