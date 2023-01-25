import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { KakaoUser } from './interfaces/kakao-user.interface';
import { UsersService } from './../users/users.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async IssueAccessToken(payload: JwtPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });

    return accessToken;
  }

  async IssueRefreshToken(payload: JwtPayload): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '14d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    return refreshToken;
  }

  async signInWithKakao(kakaoUser: KakaoUser, res: Response): Promise<string> {
    let user = await this.usersService.getUserByKakaoUid(kakaoUser.kakaoUid);

    // 회원가입X
    if (!user) {
      // DB에 유저 생성
      user = await this.usersService.createUser(kakaoUser);
    }
    // 회원가입O
    else {
      // 유저 정보 업데이트
      if (!user.ageRange && kakaoUser.ageRange) {
        await this.usersService.updateUserAgeRange(user.id, kakaoUser.ageRange);
      }
      if (!user.gender && kakaoUser.gender) {
        await this.usersService.updateUserGender(user.id, kakaoUser.gender);
      }
    }

    // access token, refresh token 발급
    const payload: JwtPayload = { name: user.nickname, sub: user.id };

    const accessToken = await this.IssueAccessToken(payload);
    const refreshToken = await this.IssueRefreshToken(payload);

    // refresh token을 DB와 쿠키에저장
    await this.usersService.updateUserRefreshToken(user.id, refreshToken);

    res.cookie('refresh', refreshToken, {
      signed: true, // 암호화
      httpOnly: true, // 브라우저에서 접근 불가능
      secure: process.env.NODE_ENV === 'development' ? false : true, // https 환경에서만 접근 허용
      maxAge: +this.configService.get<string>('COOKIE_MAX_AGE'), // msec
    });

    // client redirect url 설정
    const clientSignInCallbackUri = this.configService.get<string>('CLIENT_SIGNIN_CALLBACK_URI');
    const clientRedirectUrl = `${clientSignInCallbackUri}?access=${accessToken}`;

    return clientRedirectUrl;
  }

  async refreshToken(userId: number, refreshToken: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.getUserById(userId);

    // refresh token 검증
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw new ForbiddenException();
    }

    // 새로운 access token 발급
    const payload: JwtPayload = { name: user.nickname, sub: user.id };
    const accessToken = await this.IssueAccessToken(payload);

    return { accessToken };
  }

  async signOut(userId: number, res: Response): Promise<void> {
    await this.usersService.deleteUserRefreshToken(userId);

    res.clearCookie('refresh').status(200).send('OK');
  }

  async deleteAccount(userId: number): Promise<void> {
    return await this.usersService.deleteAccount(userId);
  }
}
