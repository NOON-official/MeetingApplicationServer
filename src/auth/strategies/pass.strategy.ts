import { KakaoUser } from '../interfaces/kakao-user.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';

@Injectable()
export class PassStrategy extends PassportStrategy(Strategy, 'pass') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_REST_API_KEY'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URI'),
    });
  }

  async validate(profile: Profile) {
    const kakaoUser = profile._json;

    const payload: string = kakaoUser.id;

    return payload;
  }
}
