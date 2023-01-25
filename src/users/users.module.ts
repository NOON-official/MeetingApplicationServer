import { InvitationsModule } from './../invitations/invitations.module';
import { UsersRepository } from './repositories/users.repository';
import { UserAgreementsRepository } from './repositories/user-agreements.repository';
import { TypeOrmExModule } from '../database/typeorm-ex.module';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UsersRepository, UserAgreementsRepository]),
    forwardRef(() => InvitationsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
