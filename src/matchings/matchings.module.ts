import { MatchingPartnerTeamRefusedListener } from './listeners/matching-partner-team-refused.listener';
import { MatchingSucceededListener } from './listeners/matching-succeeded.listener';
import { TicketsModule } from 'src/tickets/tickets.module';
import { UsersModule } from './../users/users.module';
import { TeamsModule } from './../teams/teams.module';
import { MatchingsRepository } from './repositories/matchings.repository';
import { MatchingRefuseReasonsRepository } from './repositories/matching-refuse-reasons.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { MatchingsController } from './matchings.controller';
import { forwardRef, Module } from '@nestjs/common';
import { MatchingsService } from './matchings.service';
import { TingsModule } from 'src/tings/tings.module';
import { MatchingReceivedListener } from './listeners/matching-received.listener';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([MatchingsRepository, MatchingRefuseReasonsRepository]),
    forwardRef(() => TeamsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TicketsModule),
    forwardRef(() => TingsModule),
  ],
  providers: [MatchingsService, MatchingSucceededListener, MatchingReceivedListener],
  controllers: [MatchingsController],
  exports: [MatchingsService],
})
export class MatchingsModule {}
