import { TeamsController } from './teams.controller';
import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Module({
  providers: [TeamsService],
  controllers: [TeamsController],
})
export class TeamsModule {}
