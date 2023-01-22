import { Body, Get, UseGuards } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';
import { Controller, Put } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Coupons } from './constants/Coupons';
import { RegisterCouponDto } from './dtos/register-coupon.dto';

@ApiTags('COUPON')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('coupons')
export class CouponsController {
  @ApiOperation({
    summary: '쿠폰 메타데이터 가져오기',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        Coupons,
      },
    },
  })
  @Get('metadata')
  @UseGuards(AccessTokenGuard)
  getCouponsMetadata() {}

  @ApiOperation({
    summary: '쿠폰 등록',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @Put('register')
  @UseGuards(AccessTokenGuard)
  putCouponsRegister(@Body() registerCouponDto: RegisterCouponDto) {}
}
