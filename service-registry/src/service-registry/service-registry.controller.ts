import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common';
import { ServiceRegistryService } from './service-registry.service';
import { Request } from 'express';
import {  ApiOperation } from '@nestjs/swagger';

@Controller('service-registry')
export class ServiceRegistryController {
  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  getIpAddress(@Req() request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    const ip =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.socket.remoteAddress;

    return ip.includes('::') ? `[${ip}]` : ip;
  }

  @ApiOperation({ summary: 'Register or Update a Service in Service Registry', description: 'Get a list of all tasks.' })
  @Put('')
  registerService(
    @Req() request: Request,
    @Body('name') name: string,
    @Body('version') version: string,
    @Body('port') port: number,
  ): { key: string; message: string } {
    const ip = this.getIpAddress(request);

    return this.serviceRegistry.register(name, version, ip, port);
  }

  @ApiOperation({ summary: 'Unregister a Service Service Registry', description: 'Get a list of all tasks.' })
  @Delete('')
  unregisterService(
    @Req() request: Request,
    @Body('name') name: string,
    @Body('version') version: string,
    @Body('port') port: number,
  ): { key: string; message: string } {
    const ip = this.getIpAddress(request);

    return this.serviceRegistry.unregister(name, version, ip, port);
  }

  @ApiOperation({ summary: 'Search a Service in Service Registry', description: 'Get a list of all tasks.' })
  @Get('find/:name/:version')
  searchService(
    @Param('name') name: string,
    @Param('version') version: string,
  ): any {
    const svc = this.serviceRegistry.search(name, version);

    if (!svc) {
      return {
        message: 'Service not found',
      };
    } else {
      return {
        name: svc.name,
        ip: svc.ip,
        port: svc.port,
        version: svc.version,
        timestamp: svc.timestamp,
      };
    }
  }
}
