import { Module } from '@nestjs/common';
import { TingsService } from './tings.service';
import { TypeOrmExModule } from 'src/database/typeorm-ex.module';
import { TingsRepository } from './repositories/tings.repository';
import { TingsController } from './tings.controller';
import { TingsHistoryRepository } from './repositories/tingsHistory.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([TingsRepository, TingsHistoryRepository])],
  providers: [TingsService],
  controllers: [TingsController],
  exports: [TingsService],
})
export class TingsModule {}
