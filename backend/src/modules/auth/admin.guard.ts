import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ADMIN_COOKIE, AuthService } from './auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const token = (req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIE];
    if (await this.auth.verify(token)) return true;
    throw new UnauthorizedException({ message: 'Your session has ended. Please sign in again.' });
  }
}
