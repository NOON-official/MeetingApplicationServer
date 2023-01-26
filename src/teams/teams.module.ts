import { UsersModule } from './../users/users.module';
import { TeamsRepository } from './repositories/teams.repository';
import { TeamMembersRepository } from './repositories/team-members.repository';
import { TeamAvailableDatesRepository } from './repositories/team-available-dates.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { TeamsController } from './teams.controller';
import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([TeamsRepository, TeamMembersRepository, TeamAvailableDatesRepository]),
    UsersModule,
  ],
  providers: [TeamsService],
  controllers: [TeamsController],
})
export class TeamsModule {}
