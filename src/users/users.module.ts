import { UsersRepository } from './repositories/users.repository';
import { UserAgreementsRepository } from './repositories/user-agreements.repository';
import { TypeOrmExModule } from '../database/typeorm-ex.module';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([UsersRepository, UserAgreementsRepository])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
