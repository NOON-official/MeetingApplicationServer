import { AuthService } from './auth.service';
import { KakaoProfileDto } from './dto/kakao-profile.dto';
import { ConfigService } from '@nestjs/config';
import { Controller, Get, HttpStatus, UseGuards, Req, Res, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

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

    const { accessToken, refreshToken } = await this.authService.signInWithKakao(kakaoUser);

    res.cookie('refresh', refreshToken, {
      signed: true, // 암호화
      httpOnly: true, // 브라우저에서 접근 불가능
      secure: process.env.NODE_ENV === 'development' ? false : true, // https 환경에서만 접근 허용
      maxAge: +this.configService.get<string>('COOKIE_MAX_AGE'), // msec
    });

    const clientSignInCallbackUri = this.configService.get<string>('CLIENT_SIGNIN_CALLBACK_URI');

    return { url: `${clientSignInCallbackUri}?access=${accessToken}` }; // client redirect url
  }
}
