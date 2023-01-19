import { InvitationsController } from './invitations.controller';
import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';

@Module({
  providers: [InvitationsService],
  controllers: [InvitationsController],
})
export class InvitationsModule {}
