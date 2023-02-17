import { InvitationsModule } from './../invitations/invitations.module';
import { MatchingsModule } from './../matchings/matchings.module';
import { UsersModule } from './../users/users.module';
import { TeamsModule } from './../teams/teams.module';
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TeamsModule, UsersModule, MatchingsModule, InvitationsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
