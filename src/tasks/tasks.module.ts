import { MatchingOurteamNotRespondedListener } from './../matchings/listeners/matching-ourteam-not-responded.listener';
import { MatchingPartnerTeamNotRespondedListener } from './../matchings/listeners/matching-partner-team-not-responded.listener';
import { MatchingsModule } from './../matchings/matchings.module';
import { TicketsModule } from 'src/tickets/tickets.module';
import { TeamsModule } from 'src/teams/teams.module';
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NextRecommendedTeamUpdatedListener } from 'src/teams/listeners/next-recommended-team-updated.listener';

@Module({
  imports: [TeamsModule, TicketsModule, MatchingsModule],
  providers: [
    TasksService,
    MatchingPartnerTeamNotRespondedListener,
    MatchingOurteamNotRespondedListener,
    NextRecommendedTeamUpdatedListener,
  ],
})
export class TasksModule {}
