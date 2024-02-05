// auth.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    const requestedUserId = parseInt(request.params.id, 10);

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;

      if (requestedUserId && parseInt(decoded.userId, 10) !== requestedUserId) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
