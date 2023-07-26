import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Ting } from '../entities/ting.entity';
import { Repository } from 'typeorm';

@CustomRepository(Ting)
export class TingsRepository extends Repository<Ting> {
  // 유저가 보유한 팅 개수 반환
  async getTingCountByUserId(userId: number): Promise<{ tingCount: number }> {
    const ting = await this.createQueryBuilder('ting')
      .select('ting.tingCount')
      .where('ting.userId = :userId', { userId })
      .getOne();

    let tingCount: number;

    if (!ting) {
      tingCount = 0;
    } else {
      tingCount = ting.tingCount;
    }

    return { tingCount };
  }

  async useTingByUserIdAndTingCount(userId: number, tingCount: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Ting)
      .set({ tingCount: () => `tingCount - ${tingCount}` })
      .where('userId = :userId', { userId })
      .execute();
  }

  async refundTingByUserIdAndTingCount(userId: number, tingCount: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Ting)
      .set({ tingCount: () => `tingCount + ${tingCount}` })
      .where('userId = :userId', { userId })
      .execute();
  }
}
