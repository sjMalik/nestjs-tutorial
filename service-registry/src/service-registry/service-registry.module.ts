import { Module } from '@nestjs/common';
import { ServiceRegistryService } from './service-registry.service';
import { ServiceRegistryController } from './service-registry.controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('service-registry')
@Module({
  providers: [ServiceRegistryService],
  controllers: [ServiceRegistryController],
})
export class ServiceRegistryModule {}
