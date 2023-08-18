import { NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { UserStudentCard } from '../entities/user-student-card.entity';
import { SaveStudentCardDto } from 'src/auth/dtos/save-student-card.dto';
import { AdminGetUserWithStudentCardDto } from 'src/admin/dtos/admin-get-user.dto';

@CustomRepository(UserStudentCard)
export class UserStudentCardRepository extends Repository<UserStudentCard> {
  async getAllUsersWithStudentCard(): Promise<{ users: AdminGetUserWithStudentCardDto[] }> {
    const users = await this.createQueryBuilder('user_student_card')
      .select([
        'user.id AS userId',
        'user.nickname AS nickname',
        'user.birth AS birth',
        'user.university AS university',
        'user.gender AS gender',
        'user.approval AS approval',
        'user_student_card.studentCardUrl AS studentCardUrl',
      ])
      .leftJoin(`user_student_card.user`, 'user')
      .where('user.approval IS NULL')
      .getRawMany();
    return { users };
  }

  async checkUserStudentCardByUserId(userId: number): Promise<Boolean> {
    const userStudentCard = await this.createQueryBuilder('user_student_card')
      .select()
      .where('user_student_card.userId = :userId', { userId })
      .getOne();
    if (userStudentCard) {
      return true;
    } else {
      return false;
    }
  }

  async updateUserStudentCard(userId: number, studentCard: SaveStudentCardDto): Promise<UserStudentCard> {
    const check = await this.checkUserStudentCardByUserId(userId);
    let userStudentCard;
    if (check) {
      userStudentCard = this.update({ userId }, { studentCardUrl: studentCard.studentCardUrl });
    } else {
      userStudentCard = this.create({ userId, studentCardUrl: studentCard.studentCardUrl });
      await this.save(userStudentCard);
    }

    return userStudentCard;
  }
}
