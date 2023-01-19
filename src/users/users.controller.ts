/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiTags } from '@nestjs/swagger/dist';
import { UsersService } from './users.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Post, Put } from '@nestjs/common/decorators';

@ApiTags('USER')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({
    summary: '친구 초대 횟수 조회',
    description: '친구 회원가입 완료 기준 (범위: 0 ~ 4)',
  })
  @Get(':userId/invitations/count')
  getUsersUserIdInvitationsCount() {}

  @ApiOperation({
    summary: '추천 코드 조회',
  })
  @Get(':userId/referral-id')
  getUsersUserIdReferralId() {}

  @ApiOperation({
    summary: '내 정보 조회',
    description: '이름, 전화번호 반환',
  })
  @Get(':userId/my-info')
  getUsersUserIdMyInfo() {}

  @ApiOperation({
    summary: '신청 내역 조회',
  })
  @Get(':userId/teams')
  getUsersUserIdTeams() {}

  @ApiOperation({
    summary: '전화번호 변경',
  })
  @Put(':userId/phone')
  putUsersUserIdPhone() {}

  @ApiOperation({
    summary: '미사용 이용권 개수 조회',
  })
  @Get(':userId/tickets/count')
  getUsersUserIdTicketsCount() {}

  @ApiOperation({
    summary: '할인 쿠폰 개수 조회',
  })
  @Get(':userId/coupons/count')
  getUsersUserIdCouponsCount() {}

  @ApiOperation({
    summary: '보유 쿠폰 조회',
  })
  @Get(':userId/coupons')
  getUsersUserIdCoupons() {}

  @ApiOperation({
    summary: '이용 약관 동의',
  })
  @Post(':userId/agreements')
  postUsersUserIdAgreements() {}

  @ApiOperation({
    summary: '이용 약관 동의 목록 조회',
  })
  @Get(':userId/agreements')
  getUsersUserIdAgreements() {}

  @ApiOperation({
    summary: '결제 내역 조회',
  })
  @Get(':userId/orders')
  getUsersUserIdOrders() {}

  @ApiOperation({
    summary: '유저의 팀ID 조회',
    description: '팀(매칭 신청 정보)이 없는 경우 null 반환',
  })
  @Get(':userId/team-id')
  getUsersUserIdTeamId() {}

  @ApiOperation({
    summary: '유저 전체 조회',
    description: '관리자 페이지 내 사용',
  })
  @Get()
  getUsers() {}
}
