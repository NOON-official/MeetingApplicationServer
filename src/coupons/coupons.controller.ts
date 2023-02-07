import { PassportUser } from './../auth/interfaces/passport-user.interface';
import { CouponsService } from './coupons.service';
import { Body, Get, Post, UseGuards } from '@nestjs/common';
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
import { Controller, Put } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Coupons, CouponType } from './constants/coupons';
import { RegisterCouponDto } from './dtos/register-coupon.dto';
import { GetUser } from 'src/common/get-user.decorator';
import { CreateCouponDto } from './dtos/create-coupon.dto';

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

  @ApiOperation({
    summary: '쿠폰 생성',
    description: '로그인한 유저에게 쿠폰 발급 \n\n * ex) 친구초대 4명을 채운 경우',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postCoupons(@GetUser() user: PassportUser, @Body() createCouponDto: CreateCouponDto): Promise<void> {
    return this.couponsService.createCouponWithUserId(user.sub, createCouponDto);
  }
}
