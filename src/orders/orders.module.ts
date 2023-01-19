import { OrdersController } from './orders.controller';
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
