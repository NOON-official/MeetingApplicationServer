import { KakaoUser } from './../auth/interfaces/kakao-user.interface';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private userRepository: UsersRepository) {}

  async getUserByKakaoUid(kakaoUid: number): Promise<User> {
    return this.userRepository.getUserByKakaoUid(kakaoUid);
  }

  async createUser(kakaoUser: KakaoUser): Promise<User> {
    const referralId = new Date().getTime().toString(36).toUpperCase(); // 추천인 코드 생성

    const userData = { ...kakaoUser, referralId };

    return this.userRepository.createUser(userData);
  }

  async updateUserAgeRange(userId: number, ageRange: string) {
    return this.userRepository.updateUserAgeRange(userId, ageRange);
  }

  async updateUserGender(userId: number, gender: string) {
    return this.userRepository.updateUserGender(userId, gender);
  }

  async updateUserRefreshToken(userId: number, refreshToken: string) {
    return this.userRepository.updateUserRefreshToken(userId, refreshToken);
  }

  async deleteUserRefreshToken(userId: number) {
    return this.userRepository.deleteUserRefreshToken(userId);
  }

  async getUserById(userId: number): Promise<User> {
    return this.userRepository.getUserById(userId);
  }

  async deleteAccount(userId: number): Promise<void> {
    return this.userRepository.deleteAccountByUserId(userId);
  }
}
