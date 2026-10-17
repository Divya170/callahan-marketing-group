import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';
import { Request, Response } from 'express';
import { clientIp } from '../../common/utils/client-ip';
import { ADMIN_COOKIE, AuthService } from './auth.service';

class LoginDto {
  @IsString({ message: 'Enter the passcode.' })
  @MaxLength(200)
  passcode: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = await this.auth.login(dto.passcode, clientIp(req));
    res.cookie(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.auth.secureCookies,
      path: '/',
      maxAge: this.auth.sessionMs,
    });
    return { authenticated: true };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
    return { authenticated: false };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = (req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIE];
    return { authenticated: await this.auth.verify(token), usingDefaultPasscode: this.auth.usingDefaultPasscode };
  }
}
