import { NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { UserStudentCard } from '../entities/user-student-card.entity';
import { SaveStudentCardDto } from 'src/auth/dtos/save-student-card.dto';

@CustomRepository(UserStudentCard)
export class UserStudentCardRepository extends Repository<UserStudentCard> {
  async updateUserStudentCard(userId: number, studentCard: SaveStudentCardDto): Promise<UserStudentCard> {
    const userStudentCard = this.create({ userId, studentCardUrl: studentCard.studentCardUrl });

    await this.save(userStudentCard);

    return userStudentCard;
  }
}
