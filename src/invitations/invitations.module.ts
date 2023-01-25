import { InvitationsRepository } from './repositories/invitations.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { InvitationsController } from './invitations.controller';
import { forwardRef, Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([InvitationsRepository]), forwardRef(() => UsersModule)],
  providers: [InvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
