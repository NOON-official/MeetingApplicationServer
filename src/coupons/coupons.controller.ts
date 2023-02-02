import { PassportUser } from './../auth/interfaces/passport-user.interface';
import { CouponsService } from './coupons.service';
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
import { Coupons, CouponType } from './constants/coupons';
import { RegisterCouponDto } from './dtos/register-coupon.dto';
import { GetUser } from 'src/common/get-user.decorator';

@ApiTags('COUPON')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @ApiOperation({
    summary: '쿠폰 페이지데이터 가져오기',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        Coupons,
      },
    },
  })
  @Get('pagedata')
  @UseGuards(AccessTokenGuard)
  getCouponsPagedata(): Promise<{ Coupons: CouponType[] }> {
    return this.couponsService.getCouponsPagedata();
  }

  @ApiOperation({
    summary: '쿠폰 등록',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'OK' })
  @Put('register')
  @UseGuards(AccessTokenGuard)
  putCouponsRegister(@GetUser() user: PassportUser, @Body() registerCouponDto: RegisterCouponDto): Promise<void> {
    return this.couponsService.registerCoupon(user.sub, registerCouponDto);
  }
}
