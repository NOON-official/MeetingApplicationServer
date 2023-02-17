import { UsersService } from './../../users/users.service';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // getClass를 사용하여 controller level의 roles를 가져옴
    const roles = this.reflector.get<string[]>('roles', context.getClass());

    const req = context.switchToHttp().getRequest();
    const userId = req?.user?.sub;

    // roles와 userId가 있는 경우 role 검증
    if (!!roles && !!userId) {
      return await this.matchRoles(roles, userId);
    }
  }

  // 유저가 관리자 권한을 가지고 있는지 확인
  async matchRoles(roles: string[], userId: number) {
    const user = await this.usersService.getUserById(userId);
    const userIsAdmin: boolean = user.isAdmin;

    if (roles.length === 1 && roles[0] === 'admin' && userIsAdmin) {
      return true;
    }
  }
}
