import { TicketsModule } from './../tickets/tickets.module';
import { CouponsModule } from './../coupons/coupons.module';
import { OrdersRepository } from './repositories/orders.repository';
import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { OrdersController } from './orders.controller';
import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { TingsModule } from 'src/tings/tings.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([OrdersRepository]),
    HttpModule,
    forwardRef(() => UsersModule),
    forwardRef(() => CouponsModule),
    forwardRef(() => TicketsModule),
    forwardRef(() => TingsModule),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
