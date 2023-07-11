
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { UserStudentCard } from '../entities/user-student-card.entity';
import { SaveStudentCardDto } from 'src/auth/dtos/save-student-card.dto';

@CustomRepository(UserStudentCard)
export class UserStudentCardRepository extends Repository<UserStudentCard> {
  async updateUserStudentCard(userId: number, studentCard: SaveStudentCardDto): Promise<void> {
    const result = await this.update({ id: userId }, studentCard);

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user with id ${userId}`);
    }
  }
}
