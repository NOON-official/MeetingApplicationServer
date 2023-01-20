import { AccessTokenGuard } from './../auth/guards/access-token.guard';
import { UseGuards } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger/dist';
import { UsersService } from './users.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Param, Post, Put } from '@nestjs/common/decorators';

@ApiTags('USER')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({
    summary: '친구 초대 횟수 조회',
    description: '친구 회원가입 완료 기준 (범위: 0 ~ 4)',
  })
  @ApiOkResponse({
    schema: {
      example: {
        invitationCount: 3,
      },
    },
  })
  @Get(':userId/invitations/count')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdInvitationsCount(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '추천 코드 조회',
  })
  @Get(':userId/referral-id')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdReferralId(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '내 정보 조회',
    description: '이름, 전화번호 반환',
  })
  @Get(':userId/my-info')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdMyInfo(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '신청 내역 조회',
  })
  @Get(':userId/teams')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdTeams(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '전화번호 변경',
  })
  @Put(':userId/phone')
  @UseGuards(AccessTokenGuard)
  putUsersUserIdPhone(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '미사용 이용권 개수 조회',
  })
  @Get(':userId/tickets/count')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdTicketsCount(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '할인 쿠폰 개수 조회',
  })
  @Get(':userId/coupons/count')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdCouponsCount(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '보유 쿠폰 조회',
  })
  @Get(':userId/coupons')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdCoupons(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '이용 약관 동의',
  })
  @Post(':userId/agreements')
  @UseGuards(AccessTokenGuard)
  postUsersUserIdAgreements(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '이용 약관 동의 목록 조회',
  })
  @Get(':userId/agreements')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdAgreements(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '결제 내역 조회',
  })
  @Get(':userId/orders')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdOrders(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '유저의 팀ID 조회',
    description: '팀(매칭 신청 정보)이 없는 경우 null 반환',
  })
  @Get(':userId/team-id')
  @UseGuards(AccessTokenGuard)
  getUsersUserIdTeamId(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '유저 전체 조회',
    description: '관리자 페이지 내 사용',
  })
  @Get()
  @UseGuards(AccessTokenGuard)
  getUsers() {}
}
