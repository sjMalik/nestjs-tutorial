// src/service-registry.controller.ts
import { Controller, Get, Put, Delete, Param, Req, Body } from '@nestjs/common';
import { ServiceRegistry } from './service-registry.service';
import { Request } from 'express';

@Controller('service-registry')
export class ServiceRegistryController {
  constructor(private readonly serviceRegistry: ServiceRegistry) {}

  getIpAddress(@Req() request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.socket.remoteAddress;

    return ip.includes('::') ? `[${ip}]` : ip;
  }

  @Put('')
  registerService(
    @Req() request: Request,
    @Body('name') name: string,
    @Body('version') version: string,
    @Body('port') port: number,
  ): { key: string; message: string } {
    const ip = this.getIpAddress(request);

    const { key, message } = this.serviceRegistry.register(
      name,
      version,
      ip,
      port,
    );
    return { key, message };
  }

  @Delete('')
  unregisterService(
    @Req() request: Request,
    @Body('name') name: string,
    @Body('version') version: string,
    @Body('port') port: number,
  ): { key: string; message: string } {
    const ip = this.getIpAddress(request);

    const { key, message } = this.serviceRegistry.unregister(
      name,
      version,
      ip,
      port,
    );
    return { key, message };
  }

  @Get('find/:name/:version')
  findService(
    @Param('name') name: string,
    @Param('version') version: string,
  ): any {
    const svc = this.serviceRegistry.get(name, version);
    console.log(svc);

    if (!svc) {
      return { result: 'Service not found' };
    } else {
      return {
        timestamp: svc.timestamp,
        ip: svc.ip,
        port: svc.port,
        name: svc.name,
        version: svc.version,
      };
    }
  }
}
