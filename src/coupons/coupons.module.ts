import { TypeOrmExModule } from './../database/typeorm-ex.module';
import { CouponsController } from './coupons.controller';
import { forwardRef, Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsRepository } from './repositories/coupons.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([CouponsRepository]), forwardRef(() => UsersModule)],
  providers: [CouponsService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
