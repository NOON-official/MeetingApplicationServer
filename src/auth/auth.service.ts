import { BadRequestException } from '@nestjs/common/exceptions';
import { VerifyPhoneCodeDto } from './dtos/verify-phone-code.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { KakaoUser } from './interfaces/kakao-user.interface';
import { UsersService } from './../users/users.service';
import { CACHE_MANAGER, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SavePhoneDto } from './dtos/save-phone.dto';
import { Cache } from 'cache-manager';
import { postNaverCloudSMS } from 'src/common/sms/post-navercloud-sms';
import { SmsType } from 'src/common/sms/enums/sms-type.enum';
import { ContentType } from 'src/common/sms/enums/content-type.enum';

export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async signInWithKakao(kakaoUser: KakaoUser, req: Request, res: Response): Promise<string> {
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
      // secure: process.env.NODE_ENV === 'production' ? true : false, // https 환경에서만 접근 허용
      maxAge: +this.configService.get<string>('COOKIE_MAX_AGE'), // msec
    });

    // client redirect url 설정
    const clientRedirectUrl = `${req?.cookies?.signinRedirectUrl}?access=${accessToken}`;

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

  async postVerificationCode(savePhoneDto: SavePhoneDto): Promise<void> {
    // 1. 인증 코드 생성
    const receivePhoneNumber = savePhoneDto.phone;
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    // 2. 해당 전화번호와 1:1 저장
    await this.cacheManager.set(receivePhoneNumber, code); // 제한시간 3분

    // 3. 문자로 인증 코드 발송
    const content = `[미팅학개론] 인증번호 [${code}]를 입력해주세요.`;

    await postNaverCloudSMS(SmsType.SMS, ContentType.COMM, receivePhoneNumber, content);
  }

  async verifyCodeAndSavePhone(userId: number, verifyPhoneCodeDto: VerifyPhoneCodeDto): Promise<void> {
    const phone = verifyPhoneCodeDto.phone;
    const receivedCode = verifyPhoneCodeDto.code;

    const savedCode = await this.cacheManager.get(phone);

    // 저장된 인증 코드가 없는 경우(인증 시간이 만료된 경우)
    if (!savedCode) {
      throw new NotFoundException('verification timeout');
    }

    // 입력받은 인증 코드와 저장된 인증 코드 비교
    if (receivedCode !== savedCode) {
      throw new BadRequestException('invalid verification code');
    }

    // 저장된 인증 코드 삭제 및 DB에 핸드폰번호 저장
    await this.cacheManager.del(phone);

    return await this.usersService.updateUserPhone(userId, { phone });
  }
}
