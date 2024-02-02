import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as serverIp from 'ip';
import { Logger } from '@nestjs/common';

import * as jsonData from '../package.json';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;

  // Register the microservice with the service registry
  const serviceName = jsonData.name;
  const logger = new Logger(serviceName);

  const register = async () =>
    axios.put(`${process.env.SERVICE_REGISTRY_URL}`, {
      name: serviceName,
      version: jsonData.version,
      port,
    });
  const unregister = async () =>
    axios.delete(`${process.env.SERVICE_REGISTRY_URL}`, {
      data: {
        name: serviceName,
        version: jsonData.version,
        port,
      },
    });

  try {
    const response: any = await register();
    logger.debug(`${response.data.message} ${response.data.key}`);
  } catch (error) {
    logger.error('Failed to register the service:', error.message);
  }

  const interval = setInterval(async () => {
    try {
      const response: any = await register();
      logger.debug(`${response.data.message} ${response.data.key}`);
    } catch (e) {
      logger.error('Failed to register the service:', e.message);
    }
  }, 20000);

  const cleanup = async () => {
    try {
      const response: any = await unregister();
      clearInterval(interval);
      logger.debug(`${response.data.message} ${response.data.key}`);
    } catch (e) {
      clearInterval(interval);
    }
  };

  const config = new DocumentBuilder()
    .setTitle('My NestJS API')
    .setDescription('API Description')
    .setVersion('1.0')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  process.on('uncaughtException', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });

  await app.listen(port);
  logger.verbose(`Server started @http://${serverIp.address()}:${port}`);
}
bootstrap();
