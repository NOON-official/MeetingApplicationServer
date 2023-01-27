import { TicketsRepository } from './repositories/tickets.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([TicketsRepository])],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
