import { OrdersRepository } from './repositories/orders.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { OrdersController } from './orders.controller';
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([OrdersRepository])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
