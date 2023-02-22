import { MatchingPartnerTeamNotRespondedListener } from './../matchings/listeners/matching-partner-team-not-responded.listener';
import { MatchingsModule } from './../matchings/matchings.module';
import { TicketsModule } from 'src/tickets/tickets.module';
import { TeamsModule } from 'src/teams/teams.module';
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Module({
  imports: [TeamsModule, TicketsModule, MatchingsModule],
  providers: [TasksService, MatchingPartnerTeamNotRespondedListener],
})
export class TasksModule {}