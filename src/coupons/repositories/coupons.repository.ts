import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Coupon } from '../entities/coupon.entity';
import { Repository } from 'typeorm';

@CustomRepository(Coupon)
export class CouponsRepository extends Repository<Coupon> {}
