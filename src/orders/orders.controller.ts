import { Body, Get } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Orders } from './constants/Orders';
import { CreateOrderDto } from './dtos/create-order.dto';

@ApiTags('ORDER')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('orders')
export class OrdersController {
  @ApiOperation({
    summary: '이용권 구매 페이지데이터 가져오기',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        Orders,
      },
    },
  })
  @Get('pagedata')
  @UseGuards(AccessTokenGuard)
  getTicketsPagedata() {}

  @ApiOperation({
    summary: '이용권 구매',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postOrders(@Body() createOrderDto: CreateOrderDto) {}
}
