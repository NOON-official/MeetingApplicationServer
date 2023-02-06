import { TicketsModule } from 'src/tickets/tickets.module';
import { UsersModule } from './../users/users.module';
import { TeamsModule } from './../teams/teams.module';
import { MatchingsRepository } from './repositories/matchings.repository';
import { MatchingRefuseReasonsRepository } from './repositories/matching-refuse-reasons.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { MatchingsController } from './matchings.controller';
import { forwardRef, Module } from '@nestjs/common';
import { MatchingsService } from './matchings.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([MatchingsRepository, MatchingRefuseReasonsRepository]),
    forwardRef(() => TeamsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TicketsModule),
  ],
  providers: [MatchingsService],
  controllers: [MatchingsController],
  exports: [MatchingsService],
})
export class MatchingsModule {}
