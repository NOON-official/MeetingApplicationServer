import { TicketsModule } from './../tickets/tickets.module';
import { CouponsModule } from './../coupons/coupons.module';
import { MatchingFailedListener } from './../matchings/listeners/matching-failed.listener';
import { InvitationsModule } from './../invitations/invitations.module';
import { MatchingsModule } from './../matchings/matchings.module';
import { UsersModule } from './../users/users.module';
import { TeamsModule } from './../teams/teams.module';
import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MatchingMatchedListener } from 'src/matchings/listeners/matching-matched.listener';

@Module({
  imports: [
    forwardRef(() => TeamsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MatchingsModule),
    forwardRef(() => InvitationsModule),
    forwardRef(() => CouponsModule),
    forwardRef(() => TicketsModule),
  ],
  providers: [AdminService, MatchingMatchedListener, MatchingFailedListener],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
