import { CouponsModule } from './../coupons/coupons.module';
import { InvitationsModule } from './../invitations/invitations.module';
import { UsersRepository } from './repositories/users.repository';
import { UserAgreementsRepository } from './repositories/user-agreements.repository';
import { TypeOrmExModule } from '../database/typeorm-ex.module';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TeamsModule } from 'src/teams/teams.module';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UsersRepository, UserAgreementsRepository]),
    forwardRef(() => InvitationsModule),
    forwardRef(() => TeamsModule),
    forwardRef(() => TicketsModule),
    forwardRef(() => CouponsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
