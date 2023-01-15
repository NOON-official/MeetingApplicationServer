import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { ExtractJwt, Strategy as PassportJwtStrategy } from 'passport-jwt';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_REST_API_KEY'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URI'),
      proxy: true,
    });
  }

  async validate(accessToken, refreshToken, profile: Profile, done: any) {
    console.log('heyy');
    console.log(profile);
    const kakaoUser = profile._json;

    //존재하는 유저인지 DB에서 확인 가능
    const payload = {
      kakaoUid: kakaoUser.id,
      nickname: kakaoUser.properties.nickname,
      ageRange:
        kakaoUser.kakao_account.has_age_range && !kakaoUser.kakao_account.age_range_needs_agreement
          ? kakaoUser.kakao_account.age_range
          : null,
      gender:
        kakaoUser.kakao_account.has_gender && !kakaoUser.kakao_account.gender_needs_agreement
          ? kakaoUser.kakao_account.gender
          : null,
    };

    done(null, payload);
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}
