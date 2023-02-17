import { KakaoUser } from './../interfaces/kakao-user.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_REST_API_KEY'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URI'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
    const kakaoUser = profile._json;

    const payload: KakaoUser = {
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
