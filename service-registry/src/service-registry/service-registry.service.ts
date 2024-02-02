// src/service-registry.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as semver from 'semver';

@Injectable()
export class ServiceRegistry {
  private readonly logger = new Logger('Service Registry');
  private services: { [key: string]: any }; // Replace 'any' with the actual type for services
  private timeout: number;

  constructor() {
    this.services = {};
    this.timeout = 30;
  }

  get(name: string, version: string): any | undefined {
    this.cleanup();
    const candidates = Object.values(this.services).filter(
      (service) =>
        service.name === name && semver.satisfies(service.version, version),
    );

    return candidates[Math.floor(Math.random() * candidates.length)];
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
      this.services[key] = {};
      this.services[key].timestamp = Math.floor(new Date().getTime() / 1000);
      this.services[key].ip = ip;
      this.services[key].port = port;
      this.services[key].name = name;
      this.services[key].version = version;
      this.logger.debug(
        `Added services ${name}, version ${version} at ${ip}:${port}`,
      );
      return {
        key,
        message: 'Service Added',
      };
    }

    this.services[key].timestamp = Math.floor(new Date().getTime() / 1000);
    this.logger.debug(
      `Updated services ${name}, version ${version} at ${ip}:${port}`,
    );
    return {
      key,
      message: 'Service Updated',
    };
  }

  unregister(
    name: string,
    version: string,
    ip: string,
    port: number,
  ): { key: string; message: string } {
    const key = name + version + ip + port;
    delete this.services[key];
    this.logger.debug(
      `Unregistered services ${name}, version ${version} at ${ip}:${port}`,
    );
    return {
      key,
      message: 'Service Deleted',
    };
  }

  cleanup(): void {
    const now = Math.floor(new Date().getTime() / 1000);
    Object.keys(this.services).forEach((key) => {
      if (this.services[key].timestamp + this.timeout < now) {
        delete this.services[key];
        this.logger.debug(`Removed service ${key}`);
      }
    });
  }
}

// export class ServiceRegistryService {
//   private readonly logger = new Logger('Service Registry');
//   private services: any[] = [];

//   registerService(
//     name: string,
//     version: string,
//     ip: string,
//     port: number,
//   ): string {
//     this.cleanup();
//     const timestamp = moment().toISOString();
//     const service = { id: uuidv4(), name, version, ip, port, timestamp };
//     this.services.push(service);
//     this.logger.debug(
//       `${name}:${version} service added with ip:${ip} & port:${port}`,
//     );
//     return service.id;
//   }

//   getServices(): any[] {
//     return this.services;
//   }

//   private cleanup(): void {
//     const currentTime = moment();
//     const timeout = 30 * 1000; // 30 seconds in milliseconds

//     this.services = this.services.filter((service) => {
//       const serviceTime = moment(service.timestamp);
//       const elapsedTime = currentTime.diff(serviceTime);

//       if (elapsedTime > timeout) {
//         this.logger.warn(`Removed service ${service.id}`);
//       }

//       return elapsedTime <= timeout;
//     });
//   }
// }
