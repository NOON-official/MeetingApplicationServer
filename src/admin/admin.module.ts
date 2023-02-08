import { TeamsModule } from './../teams/teams.module';
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TeamsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
