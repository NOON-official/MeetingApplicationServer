import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './auth.service';
import { KakaoProfileDto } from './dto/kakao-profile.dto';
import { ConfigService } from '@nestjs/config';
import { Controller, Get, HttpStatus, UseGuards, Req, Res, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService, private authService: AuthService) {}

  @Get('signin/kakao')
  @UseGuards(AuthGuard('kakao'))
  signinKakao() {
    return HttpStatus.OK;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @Redirect()
  async kakaoCallback(@Req() req, @Res() res: Response): Promise<{ url: string }> {
    const kakaoUser: KakaoProfileDto = req.user;

    const clientRedirectUrl = await this.authService.signInWithKakao(kakaoUser, res);

    return { url: clientRedirectUrl };
  }

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  refresh(@Req() req: Request): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(req.user['sub'], req.user['refreshToken']);
  }

  @Get('signout')
  @UseGuards(AccessTokenGuard)
  @Redirect('/')
  async signout(@Req() req: Request, @Res() res: Response) {
    await this.authService.signOut(req.user['sub'], res);
  }
}
