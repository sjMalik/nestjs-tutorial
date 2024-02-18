import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Auth Service');

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setVersion('0.0.1')
    .setDescription('Authentication & Authorization')
    .addTag('auth-service')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3100);
  logger.log(`Server started @http://locahost:3100`)
}
bootstrap();
