import { SavePhoneDto } from './../../auth/dtos/save-phone.dto';
import { User } from './../entities/user.entity';
import { CreateUserDto } from './../dtos/create-user.dto';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateUniversityDto, UpdateUserDto } from '../dtos/update-user.dto';

@CustomRepository(User)
export class UsersRepository extends Repository<User> {
  async getUserByKakaoUid(kakaoUid: number): Promise<User> {
    const user = await this.findOneBy({ kakaoUid });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.create(createUserDto);

    await this.save(user);

    return user;
  }

  async updateAgeRange(userId: number, ageRange: string) {
    await this.update({ id: userId }, { ageRange });
  }

  async updateGender(userId: number, gender: string) {
    await this.update({ id: userId }, { gender });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.update({ id: userId }, { refreshToken });
  }

  async deleteRefreshToken(userId: number) {
    await this.update({ id: userId }, { refreshToken: null });
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }

    return user;
  }

  async deleteAccountByUserId(userId: number): Promise<void> {
    await this.getUserById(userId); // 유저 존재 확인

    const result = await this.softDelete({ id: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async getUserByReferralId(referralId: string): Promise<User> {
    const user = await this.findOneBy({ referralId: referralId });

    if (!user) {
      throw new NotFoundException(`Can't find user with referralId ${referralId}`);
    }

    return user;
  }

  async getReferralIdByUserId(userId: number): Promise<{ referralId: string }> {
    await this.getUserById(userId);

    const referralId = (await this.findOneBy({ id: userId })).referralId;

    return { referralId };
  }

  async getMyInfoByUserId(userId: number): Promise<{
    nickname: string;
    phone: string;
    gender: string;
    university: number;
    birth: number;
    isVerified: boolean;
    approval: boolean | null;
  }> {
    await this.getUserById(userId);

    const { nickname, phone, gender, university, birth, isVerified, approval } = await this.createQueryBuilder('user')
      .select(['user.nickname'])
      .addSelect('user.phone')
      .addSelect('user.gender')
      .addSelect('user.university')
      .addSelect('user.birth')
      .addSelect('user.isVerified')
      .addSelect('user.approval')
      .where('user.id = :userId', { userId })
      .getOne();

    return { nickname, phone, gender, university, birth, isVerified, approval };
  }

  async updateUserPhone(userId: number, phone: SavePhoneDto): Promise<void> {
    const result = await this.update({ id: userId }, phone);

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async updateUserInfo(userId: number, updateInfo: UpdateUserDto): Promise<void> {
    const result = await this.update({ id: userId }, updateInfo);

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async updateUniversity(userId: number, updateUniversity: UpdateUniversityDto) {
    const result = await this.update({ id: userId }, updateUniversity);
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.find();
  }

  async applyByUserStudentCard(userId: number): Promise<void> {
    const result = await this.update({ id: userId }, { isVerified: true });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async verifyUserByStudentCard(userId: number): Promise<void> {
    const result = await this.update({ id: userId }, { approval: true });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async declineUserByStudentCard(userId: number): Promise<void> {
    const result = await this.update({ id: userId }, { approval: false });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }

  async resetApprovalUserStudentCard(userId: number): Promise<void> {
    const result = await this.update({ id: userId }, { approval: null });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }
}
