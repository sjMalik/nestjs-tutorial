import { Injectable, Logger } from '@nestjs/common';
import * as semvar from 'semver';

@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger('Service Registry');
  private services: { [key: string]: any };
  private timeout: number;

  constructor() {
    this.services = {};
    this.timeout = 30;
  }

  register(
    name: string,
    version: string,
    ip: string,
    port: number,
  ): { key: string; message: string } {
    this.cleanup();

    const key = name + version + ip + port;

    if (!this.services[key]) {
      // Service not registered add a new entry
      this.services[key] = {};
      this.services[key].timestamp = Math.floor(new Date().getTime() / 1000);
      this.services[key].name = name;
      this.services[key].ip = ip;
      this.services[key].port = port;
      this.services[key].version = version;

      this.logger.debug(
        `Added service ${name} at ${ip}:${port} with version ${version}`,
      );

      return {
        key,
        message: 'Service succefully registered',
      };
    }

    this.services[key].timestamp = Math.floor(new Date().getTime() / 1000);

    this.logger.debug(
      `Updated service ${name} at ${ip}:${port} with version ${version}`,
    );

    return {
      key,
      message: 'Service succefully updated',
    };
  }

  cleanup(): void {
    const now = Math.floor(new Date().getTime() / 1000);

    Object.keys(this.services).forEach((key) => {
      if (this.services[key].timestamp + this.timeout < now) {
        delete this.services[key];
        this.logger.warn(`Removed services ${key}`);
      }
    });
  }

  unregister(
    name: string,
    version: string,
    ip: string,
    port: number,
  ): { key: string; message: string } {
    const key = name + version + ip + port;
    delete this.services[key];
    this.logger.warn(
      `Removed service ${name} at ${ip}:${port} with version ${version}`,
    );

    return {
      key,
      message: 'Service removed',
    };
  }

  search(name: string, version: string): any {
    this.cleanup();

    const candidates = Object.values(this.services).filter((service) => {
      return (
        service.name === name && semvar.satisfies(service.version, version)
      );
    });

    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
