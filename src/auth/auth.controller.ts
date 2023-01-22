/* eslint-disable @typescript-eslint/no-empty-function */
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthService } from './auth.service';
import { KakaoProfileDto } from './dtos/kakao-profile.dto';
import { Controller, Get, HttpStatus, UseGuards, Req, Res, Redirect, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger/dist';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist/decorators';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '카카오 로그인',
    description:
      '프론트엔드에서 href 형태로 요청 보내주시면 됩니다. \n\n ex) \\<a href="http:\\//localhost:5000/auth/signin/kakao">로그인\\</a> \n\n <a href="http://localhost:5000/auth/signin/kakao">카카오 로그인 테스트</a>',
  })
  @ApiResponse({
    description:
      '* Access Token: 서버 .env에 지정된 redirect url에 query 형태로 반환됩니다. \n\n ex) http:\\//localhost:3000/auth/signin/kakao/success/?access=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9~\n\n * Refresh Token: 쿠키에 refresh라는 이름으로 저장됩니다.',
  })
  @Get('signin/kakao')
  @UseGuards(AuthGuard('kakao'))
  getAuthSigninKakao() {
    return HttpStatus.OK;
  }

  @ApiExcludeEndpoint()
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @Redirect()
  async getAuthKakaoCallback(@Req() req, @Res() res: Response): Promise<{ url: string }> {
    const kakaoUser: KakaoProfileDto = req.user;

    const clientRedirectUrl = await this.authService.signInWithKakao(kakaoUser, res);

    return { url: clientRedirectUrl };
  }

  @ApiOperation({
    summary: 'Access Token 재발급',
    description:
      'Refresh Token이 만료되지 않은 경우 Access Token을 재발급합니다. \n\n Refresh Token도 만료된 경우(401 Unauthorized) 재로그인 해야합니다.',
  })
  @ApiCookieAuth()
  @ApiOkResponse({
    schema: {
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoi66y46rec7JuQIiwic3ViIjoxNDcsImlhdCI6MTY3NDAzMzczNywiZXhwIjoxNjc0MDQwOTM3fQ.Xvzy6JGnMK_av67jTuuQeRuPp7TZkExGgwnUnIWezpE',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  getAuthRefresh(@Req() req: Request): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(req.user['sub'], req.user['refreshToken']);
  }

  @ApiOperation({
    summary: '로그아웃',
    description: '쿠키에 있는 refresh token을 삭제합니다. access token은 프론트엔드에서 삭제 처리 해주시면 됩니다.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('signout')
  @UseGuards(AccessTokenGuard)
  getAuthSignout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    return this.authService.signOut(req.user['sub'], res);
  }

  @ApiOperation({
    summary: '회원 탈퇴',
    description: 'DB에 있는 유저 정보 삭제',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('account')
  @UseGuards(AccessTokenGuard)
  deleteAuthAccount() {}
}
