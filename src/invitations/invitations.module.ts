import { InvitationSucceededListener } from './listeners/invitation-succeeded.listener';
import { CouponsModule } from './../coupons/coupons.module';
import { InvitationsRepository } from './repositories/invitations.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { InvitationsController } from './invitations.controller';
import { forwardRef, Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { UsersModule } from 'src/users/users.module';
import { InvitationCreatedListener } from './listeners/invitation-created.listener';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([InvitationsRepository]),
    forwardRef(() => UsersModule),
    forwardRef(() => CouponsModule),
  ],
  providers: [InvitationsService, InvitationCreatedListener, InvitationSucceededListener],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
