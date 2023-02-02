import { MatchingsRepository } from './repositories/matchings.repository';
import { MatchingRefuseReasonsRepository } from './repositories/matching-refuse-reasons.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { MatchingsController } from './matchings.controller';
import { Module } from '@nestjs/common';
import { MatchingsService } from './matchings.service';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([MatchingsRepository, MatchingRefuseReasonsRepository])],
  providers: [MatchingsService],
  controllers: [MatchingsController],
  exports: [MatchingsService],
})
export class MatchingsModule {}
