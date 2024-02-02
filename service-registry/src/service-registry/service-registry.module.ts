import { Module } from '@nestjs/common';
import { ServiceRegistry } from './service-registry.service';
import { ServiceRegistryController } from './service-registry.controller';

@Module({
  providers: [ServiceRegistry],
  controllers: [ServiceRegistryController],
})
export class ServiceRegistryModule {}
