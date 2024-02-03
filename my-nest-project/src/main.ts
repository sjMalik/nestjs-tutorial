import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as serverIP from 'ip';
import { Logger } from '@nestjs/common';
import * as projectInfo from '../package.json';

async function bootstrap() {
  dotenv.config();
  const serverIpAddress = serverIP.address();
  const name = projectInfo.name;
  const port = process.env.PORT;
  const app = await NestFactory.create(AppModule);

  const logger = new Logger(name);

  const config = new DocumentBuilder()
    .setTitle('My NestJS API')
    .setDescription('API Description')
    .setVersion('1.0')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  logger.verbose(`${name} started @http://${serverIpAddress}:${port}`)
}
bootstrap();
