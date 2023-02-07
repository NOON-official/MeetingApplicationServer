import { BadRequestException, HttpException } from '@nestjs/common/exceptions';
import { VerifyPhoneCodeDto } from './dtos/verify-phone-code.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { KakaoUser } from './interfaces/kakao-user.interface';
import { UsersService } from './../users/users.service';
import { CACHE_MANAGER, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { SavePhoneDto } from './dtos/save-phone.dto';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Method } from 'axios';
import * as crypto from 'crypto';

export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
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

  async getNaverCloudSignature(method: Method, url: string, timestamp: string, accessKey: string, secretKey: string) {
    const message = [];
    const space = ' '; // one space
    const newLine = '\n'; // new line

    const hmac = crypto.createHmac('sha256', secretKey);
    const verificationUrl = url.split('https://sens.apigw.ntruss.com')[1];

    message.push(method);
    message.push(space);
    message.push(verificationUrl);
    message.push(newLine);
    message.push(timestamp);
    message.push(newLine);
    message.push(accessKey);

    const signature = hmac.update(message.join('')).digest('base64').toString();

    return signature;
  }

  async postNaverCloudSMS(sendPhoneNumber: string, receivePhoneNumber: string, content: string) {
    const accessKey = this.configService.get<string>('NAVERCLOUD_ACCESS_KEY');
    const secretKey = this.configService.get<string>('NAVERCLOUD_SECRET_KEY');
    const serviceId = this.configService.get<string>('NAVERCLOUD_SENS_SERVICE_ID');

    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`;
    const timestamp = Date.now().toString();

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-apigw-signature-v2': await this.getNaverCloudSignature('POST', url, timestamp, accessKey, secretKey),
      },
    };

    const requestData = {
      type: 'SMS',
      contentType: 'COMM', // 일반 메시지
      countryCode: '82', // 국가 번호
      from: sendPhoneNumber, // 발신 번호
      content, // 문자 내용
      messages: [
        {
          to: receivePhoneNumber, // 수신 번호
        },
      ],
    };

    await firstValueFrom(
      this.httpService.post(url, requestData, requestConfig).pipe(
        catchError((error) => {
          throw new HttpException(error.response.data, error.response.status);
        }),
      ),
    );
  }

  async postVerificationCode(savePhoneDto: SavePhoneDto): Promise<void> {
    // 1. 인증 코드 생성
    const receivePhoneNumber = savePhoneDto.phone;
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    // 2. 해당 전화번호와 1:1 저장
    await this.cacheManager.set(receivePhoneNumber, code); // 제한시간 3분

    // 3. 문자로 인증 코드 발송
    const sendPhoneNumber = this.configService.get<string>('SEND_MESSAGE_PHONE_NUMBER');
    const content = `[미팅학개론] 인증번호 [${code}]를 입력해주세요.`;

    await this.postNaverCloudSMS(sendPhoneNumber, receivePhoneNumber, content);
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
