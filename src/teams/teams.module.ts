import { AdminModule } from './../admin/admin.module';
import { TeamCreatedListener } from './listeners/team-created.listener';
import { MatchingsModule } from './../matchings/matchings.module';
import { UsersModule } from './../users/users.module';
import { TeamsRepository } from './repositories/teams.repository';
import { TeamMembersRepository } from './repositories/team-members.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { TeamsController } from './teams.controller';
import { forwardRef, Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { RecommendedTeam } from './entities/recommended-team.entity';
import { NextRecommendedTeam } from './entities/next-recommended-team.entity';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([TeamsRepository, TeamMembersRepository, RecommendedTeam, NextRecommendedTeam]),
    forwardRef(() => UsersModule),
    forwardRef(() => MatchingsModule),
    forwardRef(() => AdminModule),
  ],
  providers: [TeamsService, TeamCreatedListener],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
