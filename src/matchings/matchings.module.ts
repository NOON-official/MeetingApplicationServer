import { MatchingsController } from './matchings.controller';
import { Module } from '@nestjs/common';
import { MatchingsService } from './matchings.service';

@Module({
  providers: [MatchingsService],
  controllers: [MatchingsController],
})
export class MatchingsModule {}
