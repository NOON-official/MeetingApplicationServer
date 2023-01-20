import { InvitationsRepository } from './repositories/invitations.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { InvitationsController } from './invitations.controller';
import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([InvitationsRepository])],
  providers: [InvitationsService],
  controllers: [InvitationsController],
})
export class InvitationsModule {}
