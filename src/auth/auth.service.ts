import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist';
import { KakaoProfileDto } from './dto/kakao-profile.dto';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signInWithKakao(kakaoUser: KakaoProfileDto): Promise<{ accessToken: string; refreshToken: string }> {
    let user = await this.userService.getUserByKakaoUid(kakaoUser.kakaoUid);

    // 회원가입X
    if (!user) {
      // DB에 유저 생성
      user = await this.userService.createUser(kakaoUser);
    }
    // 회원가입O
    else {
      // 유저 정보 업데이트
      if (!user.ageRange && kakaoUser.ageRange) {
        await this.userService.updateUserAgeRange(user.id, kakaoUser.ageRange);
      }
      if (!user.gender && kakaoUser.gender) {
        await this.userService.updateUserGender(user.id, kakaoUser.gender);
      }
    }

    // access token, refresh token 발급
    const payload = { name: user.nickname, sub: user.id };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '14d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // refresh token을 DB에저장
    await this.userService.updateUserRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
