import { Injectable } from '@nestjs/common';
import { TingsRepository } from './repositories/tings.repository';
import { Ting } from './entities/ting.entity';
import { CreateTingDto } from './dtos/create-ting.dto';
import { TingsHistoryRepository } from './repositories/tingsHistory.repository';
import { GetUserTingHistoryDto } from 'src/users/dtos/get-user.dto';
import { CreateTingHistoryDto } from './dtos/create-ting-history.dto';
import { TingHistory } from './entities/tingHistroy.entity';

@Injectable()
export class TingsService {
  constructor(private tingsRepository: TingsRepository, private tingsHistoryRepository: TingsHistoryRepository) {}

  async getTingCountByUserId(userId: number): Promise<{ tingCount: number }> {
    return this.tingsRepository.getTingCountByUserId(userId);
  }

  async useTingByUserIdAndTingCount(userId: number, tingCount: number): Promise<void> {
    await this.tingsRepository.useTingByUserIdAndTingCount(userId, tingCount);
  }

  async refundTingByUserIdAndTingCount(userId: number, tingCount: number): Promise<void> {
    await this.tingsRepository.refundTingByUserIdAndTingCount(userId, tingCount);
  }

  async createTingByUserId(createTingDto: CreateTingDto): Promise<Ting> {
    return this.tingsRepository.createTingByUserId(createTingDto);
  }

  async getUsersTingsHistrory(userId: number): Promise<{ tingHistories: GetUserTingHistoryDto[] }> {
    return this.tingsHistoryRepository.getUsersTingsHistrory(userId);
  }
  async recordUsingTingByUserId(createTingHistoryDto: CreateTingHistoryDto): Promise<TingHistory> {
    return this.tingsHistoryRepository.createTingHistoryByUserId(createTingHistoryDto);
  }
}
