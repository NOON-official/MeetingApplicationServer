import { Injectable } from '@nestjs/common';
import { TingsRepository } from './repositories/tings.repository';

@Injectable()
export class TingsService {
  constructor(private tingsRepository: TingsRepository) {}

  async getTingCountByUserId(userId: number): Promise<{ tingCount: number }> {
    return this.tingsRepository.getTingCountByUserId(userId);
  }

  async useTingByUserIdAndTingCount(userId: number, tingCount: number): Promise<void> {
    await this.tingsRepository.useTingByUserIdAndTingCount(userId, tingCount);
  }

  async refundTingByUserIdAndTingCount(userId: number, tingCount: number): Promise<void> {
    await this.tingsRepository.refundTingByUserIdAndTingCount(userId, tingCount);
  }
}
