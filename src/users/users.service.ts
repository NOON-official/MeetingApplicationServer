import { InvitationsService } from './../invitations/invitations.service';
import { KakaoUser } from './../auth/interfaces/kakao-user.interface';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    private usersRepository: UsersRepository,
  ) {}

  async getUserByKakaoUid(kakaoUid: number): Promise<User> {
    return this.usersRepository.getUserByKakaoUid(kakaoUid);
  }

  async createUser(kakaoUser: KakaoUser): Promise<User> {
    const referralId = new Date().getTime().toString(36).toUpperCase(); // 추천인 코드 생성

    const userData = { ...kakaoUser, referralId };

    return this.usersRepository.createUser(userData);
  }

  async updateUserAgeRange(userId: number, ageRange: string) {
    return this.usersRepository.updateAgeRange(userId, ageRange);
  }

  async updateUserGender(userId: number, gender: string) {
    return this.usersRepository.updateGender(userId, gender);
  }

  async updateUserRefreshToken(userId: number, refreshToken: string) {
    return this.usersRepository.updateRefreshToken(userId, refreshToken);
  }

  async deleteUserRefreshToken(userId: number) {
    return this.usersRepository.deleteRefreshToken(userId);
  }

  async getUserById(userId: number): Promise<User> {
    return this.usersRepository.getUserById(userId);
  }

  async deleteAccount(userId: number): Promise<void> {
    return this.usersRepository.deleteAccountByUserId(userId);
  }

  async getUserByReferralId(referralId: string): Promise<User> {
    return this.usersRepository.getUserByReferralId(referralId);
  }

  async getInvitationCountByUserId(userId: number): Promise<{ invitationCount: number }> {
    let { invitationCount } = await this.invitationsService.getInvitationCountByUserId(userId);

    // 초대횟수가 4회 이상인 경우 4 반환
    if (invitationCount > 4) {
      invitationCount = 4;
    }

    return { invitationCount };
  }
}
