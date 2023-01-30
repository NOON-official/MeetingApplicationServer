import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { CouponsController } from './coupons.controller';
import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsRepository } from './repositories/coupons.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([CouponsRepository])],
  providers: [CouponsService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
