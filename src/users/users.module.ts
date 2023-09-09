import { OrdersModule } from './../orders/orders.module';
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
import { UserStudentCardRepository } from './repositories/user-student-card.repository';
import { MatchingsModule } from 'src/matchings/matchings.module';
import { TingsModule } from 'src/tings/tings.module';
import { StudentCardVerifiedListener } from './listeners/student-card-verified.listener';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UsersRepository, UserAgreementsRepository, UserStudentCardRepository]),
    forwardRef(() => InvitationsModule),
    forwardRef(() => TeamsModule),
    forwardRef(() => TicketsModule),
    forwardRef(() => CouponsModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => MatchingsModule),
    forwardRef(() => TingsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, StudentCardVerifiedListener],
  exports: [UsersService],
})
export class UsersModule {}
