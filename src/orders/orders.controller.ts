import { PassportUser } from './../auth/interfaces/passport-user.interface';
import { Body, Get } from '@nestjs/common';
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
import { Products, ProductType } from './constants/products';
import { CreateOrderDto } from './dtos/create-order.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { OrdersService } from './orders.service';

@ApiTags('ORDER')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({
    summary: '이용권 구매 페이지데이터 가져오기',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        Products,
      },
    },
  })
  @Get('pagedata')
  @UseGuards(AccessTokenGuard)
  getTicketsPagedata(): Promise<{ Products: ProductType[] }> {
    return this.ordersService.getProductsPagedata();
  }

  @ApiOperation({
    summary: '이용권 구매',
    description:
      '토스 결제 정보가 없는 경우(구매금액 0원) => toss: null \n\n 사용한 쿠폰이 없는 경우 => couponId: null',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postOrders(@GetUser() user: PassportUser, @Body() createOrderDto: CreateOrderDto): Promise<void> {
    return this.ordersService.createOrder(user.sub, createOrderDto);
  }

  @ApiOperation({
    summary: '페이플 파트너 인증',
    description: '파트너 인증 후 페이플 결제 요청(결제창 호출) 가능',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Created' })
  @Get('payple/auth')
  @UseGuards(AccessTokenGuard)
  getOrdersPaypleAuth() {
    return this.ordersService.getPaypleAuth();
  }
}
