import { Order } from '../entities/order.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { CreateOrder } from '../interfaces/create-order.interface';
import { User } from 'src/users/entities/user.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { NotFoundException } from '@nestjs/common';

@CustomRepository(Order)
export class OrdersRepository extends Repository<Order> {
  async createOrder(createOrderData: CreateOrder, user: User, coupon?: Coupon): Promise<{ orderId: number }> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(Order)
      .values({
        ...createOrderData,
        user,
        coupon,
      })
      .execute();

    const orderId = result.identifiers[0].id;

    return { orderId };
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.findOneBy({ id: orderId });

    if (!order) {
      throw new NotFoundException(`Can't find order with id ${orderId}`);
    }

    return order;
  }
}
