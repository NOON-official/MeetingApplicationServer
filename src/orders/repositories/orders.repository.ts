import { Order } from '../entities/order.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(Order)
export class OrdersRepository extends Repository<Order> {}
