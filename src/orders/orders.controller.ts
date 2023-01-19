/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';
import { Controller, Post } from '@nestjs/common';

@ApiTags('ORDER')
@Controller('orders')
export class OrdersController {
  @ApiOperation({
    summary: '이용권 구매',
  })
  @Post()
  postOrders() {}
}
