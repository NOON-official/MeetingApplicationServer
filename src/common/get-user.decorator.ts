import { KakaoUser } from './../auth/interfaces/kakao-user.interface';
import { User } from '../users/entities/user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PassportUser } from 'src/auth/interfaces/passport-user.interface';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): KakaoUser | PassportUser | User => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
