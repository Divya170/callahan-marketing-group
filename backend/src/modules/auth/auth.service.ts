import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'crypto';
import { AppConfig, DEFAULT_ADMIN_PASSCODE } from '../../config/configuration';

export const ADMIN_COOKIE = 'cmg_admin';

const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly cfg: AppConfig;
  /** Failed sign-in attempts per client, kept in memory. */
  private readonly fails = new Map<string, { count: number; until: number }>();

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.cfg = config.get<AppConfig>('app')!;
  }

  get sessionMs(): number {
    return this.cfg.adminSessionHours * 60 * 60 * 1000;
  }

  get usingDefaultPasscode(): boolean {
    return this.cfg.adminPasscode === DEFAULT_ADMIN_PASSCODE;
  }

  get secureCookies(): boolean {
    return this.cfg.nodeEnv === 'production';
  }

  private static digest(v: string): Buffer {
    return createHash('sha256').update(v, 'utf8').digest();
  }

  async login(passcode: string, clientKey: string): Promise<string> {
    const now = Date.now();
    const f = this.fails.get(clientKey);
    if (f && f.count >= MAX_FAILS && f.until > now) {
      const mins = Math.ceil((f.until - now) / 60000);
      throw new HttpException(
        { message: `Too many attempts. Please wait ${mins} minute${mins === 1 ? '' : 's'} and try again.` },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const ok = timingSafeEqual(AuthService.digest(String(passcode || '')), AuthService.digest(this.cfg.adminPasscode));
    if (!ok) {
      const count = f && f.until > now ? f.count + 1 : 1;
      this.fails.set(clientKey, { count, until: now + LOCK_MS });
      throw new UnauthorizedException({ message: 'That passcode isn’t right.' });
    }

    this.fails.delete(clientKey);
    return this.jwt.signAsync({ sub: 'admin', role: 'admin' }, { expiresIn: `${this.cfg.adminSessionHours}h` });
  }

  async verify(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    try {
      const payload = await this.jwt.verifyAsync<{ role?: string }>(token);
      return payload.role === 'admin';
    } catch {
      return false;
    }
  }
}
