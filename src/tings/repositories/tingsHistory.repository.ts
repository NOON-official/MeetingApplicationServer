import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { CreateTingDto } from '../dtos/create-ting.dto';
import { BadRequestException } from '@nestjs/common';
import { TingHistory } from '../entities/tingHistroy.entity';
import { CreateTingHistoryDto } from '../dtos/create-ting-history.dto';
import { GetUserTingHistoryDto } from 'src/users/dtos/get-user.dto';

@CustomRepository(TingHistory)
export class TingsHistoryRepository extends Repository<TingHistory> {
  async getUsersTingsHistrory(userId: number): Promise<{ tingHistories: GetUserTingHistoryDto[] }> {
    const tingHistories = await this.createQueryBuilder('ting_history')
      .select(['ting_history.id', 'ting_history.case', 'ting_history.usingTing', 'ting_history.createdAt'])
      .where('ting_history.userId = :userId', { userId })
      .orderBy('ting_history.createdAt', 'ASC')
      .getMany();
    return { tingHistories };
  }

  async createTingHistoryByUserId(createTingHistoryDto: CreateTingHistoryDto): Promise<TingHistory> {
    const tingHistory = this.create(createTingHistoryDto);

    await this.save(tingHistory);

    return tingHistory;
  }
}
