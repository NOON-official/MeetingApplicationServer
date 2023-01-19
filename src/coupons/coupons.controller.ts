/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';
import { Controller, Put } from '@nestjs/common';

@ApiTags('COUPON')
@Controller('coupons')
export class CouponsController {
  @ApiOperation({
    summary: '쿠폰 등록',
  })
  @Put('register')
  putCouponsRegister() {}
}
