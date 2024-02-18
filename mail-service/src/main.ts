import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Mail Service');
  const config = new DocumentBuilder()
    .setTitle('Mail Service')
    .setVersion('0.0.1')
    .setDescription(
      'Create Draft Mail, List Draft Mail, Send Mail, List Inbox and Sent Mail APIs',
    )
    .addTag('mail-service')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
  logger.log(`Server started @http://locahost:3000`);
}
bootstrap();
