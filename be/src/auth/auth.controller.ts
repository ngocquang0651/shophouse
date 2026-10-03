import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { CookieOptions, Request, Response } from "express";
import type { CookieSameSite } from "../common/env.validation";
import { LOGIN_THROTTLE_LIMIT, LOGIN_THROTTLE_TTL_MS, THROTTLE_SHORT } from "../common/throttler.config";
import { AUTH_COOKIE_NAME, buildAuthCookieOptions, parseCookieMaxAge } from "./auth-cookie";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService
  ) {
    this.cookieOptions = buildAuthCookieOptions({
      isProduction: configService.getOrThrow<string>("NODE_ENV") === "production",
      sameSite: configService.getOrThrow<CookieSameSite>("COOKIE_SAME_SITE")
    });
  }

  @Post("login")
  @Throttle({ [THROTTLE_SHORT]: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    response.cookie(AUTH_COOKIE_NAME, result.accessToken, {
      ...this.cookieOptions,
      maxAge: parseCookieMaxAge(process.env.JWT_COOKIE_MAX_AGE_MS)
    });
    return { user: result.user };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request) {
    return request.user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions);
    return { ok: true };
  }
}
