import { UsersModule } from '../users/users.module';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  providers: [KakaoStrategy, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
