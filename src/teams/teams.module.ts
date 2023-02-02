import { MatchingsModule } from './../matchings/matchings.module';
import { UsersModule } from './../users/users.module';
import { TeamsRepository } from './repositories/teams.repository';
import { TeamMembersRepository } from './repositories/team-members.repository';
import { TeamAvailableDatesRepository } from './repositories/team-available-dates.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { TeamsController } from './teams.controller';
import { forwardRef, Module } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([TeamsRepository, TeamMembersRepository, TeamAvailableDatesRepository]),
    forwardRef(() => UsersModule),
    forwardRef(() => MatchingsModule),
  ],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
