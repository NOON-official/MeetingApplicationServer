import { CouponsController } from './coupons.controller';
import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Module({
  providers: [CouponsService],
  controllers: [CouponsController],
})
export class CouponsModule {}
