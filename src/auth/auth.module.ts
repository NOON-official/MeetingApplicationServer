import { MatchingsModule } from './../matchings/matchings.module';
import { TeamsModule } from 'src/teams/teams.module';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { UsersModule } from '../users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    JwtModule.register({}),
    HttpModule,
    UsersModule,
    forwardRef(() => TeamsModule),
    forwardRef(() => MatchingsModule),
  ],
  providers: [AuthService, KakaoStrategy, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
