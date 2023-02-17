import { MatchingStatus } from './../matchings/interfaces/matching-status.enum';
import { UserAgreement } from './entities/user-agreement.entity';
import { UserCoupon } from './interfaces/user-coupon.interface';
import { UserTeam } from './interfaces/user-team.interface';
import { CreateAgreementDto } from './dtos/create-agreement.dto';
import { AccessTokenGuard } from './../auth/guards/access-token.guard';
import { UseGuards } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';
import { UsersService } from './users.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Body, Post, Put } from '@nestjs/common/decorators';
import { GetUser } from 'src/common/get-user.decorator';
import { PassportUser } from 'src/auth/interfaces/passport-user.interface';
import { UserOrder } from './interfaces/user-order.interface';

@ApiTags('USER')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
  @Get('invitations/count')
  @UseGuards(AccessTokenGuard)
  getUsersInvitationsCount(@GetUser() user: PassportUser): Promise<{ invitationCount: number }> {
    return this.usersService.getInvitationCountByUserId(user.sub);
  }

  @ApiOperation({
    summary: '추천 코드 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        referralId: 'LD4GSTO3',
      },
    },
  })
  @Get('referral-id')
  @UseGuards(AccessTokenGuard)
  getUsersReferralId(@GetUser() user: PassportUser): Promise<{ referralId: string }> {
    return this.usersService.getReferralIdByUserId(user.sub);
  }

  @ApiOperation({
    summary: '내 정보 조회',
    description: '이름, 전화번호 반환',
  })
  @ApiOkResponse({
    schema: {
      example: {
        nickname: '미팅이',
        phone: '01012345678',
      },
    },
  })
  @Get('my-info')
  @UseGuards(AccessTokenGuard)
  getUsersMyInfo(@GetUser() user: PassportUser): Promise<{ nickname: string; phone: string }> {
    return this.usersService.getMyInfoByUserId(user.sub);
  }

  @ApiOperation({
    summary: '신청 내역 조회',
    description: '인원수, 신청날짜 반환 \n\n chatCreatedAt이 null이 아닌 경우 "매칭 완료"로 표시해주세요.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          { id: 1, memberCount: 2, createdAt: '2023-01-20T21:37:26.886Z', chatCreatedAt: '2023-01-20T21:37:26.886Z' },
          { id: 4, memberCount: 3, createdAt: '2023-01-20T21:37:26.886Z', chatCreatedAt: null },
        ],
      },
    },
  })
  @Get('teams')
  @UseGuards(AccessTokenGuard)
  getUsersTeams(@GetUser() user: PassportUser): Promise<{ teams: UserTeam[] }> {
    return this.usersService.getTeamsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '미사용 이용권 개수 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        ticketCount: 5,
      },
    },
  })
  @Get('tickets/count')
  @UseGuards(AccessTokenGuard)
  getUsersTicketsCount(@GetUser() user: PassportUser): Promise<{ ticketCount: number }> {
    return this.usersService.getTicketCountByUserId(user.sub);
  }

  @ApiOperation({
    summary: '할인 쿠폰 개수 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        couponCount: 5,
      },
    },
  })
  @Get('coupons/count')
  @UseGuards(AccessTokenGuard)
  getUsersCouponsCount(@GetUser() user: PassportUser): Promise<{ couponCount: number }> {
    return this.usersService.getCouponCountByUserId(user.sub);
  }

  @ApiOperation({
    summary: '보유 쿠폰 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        coupons: [
          { id: 1, typeId: 1, expiresAt: '2023-01-22' },
          { id: 2, typeId: 2, expiresAt: '2023-01-22' },
        ],
      },
    },
  })
  @Get('coupons')
  @UseGuards(AccessTokenGuard)
  getUsersCoupons(@GetUser() user: PassportUser): Promise<{ coupons: UserCoupon[] }> {
    return this.usersService.getCouponsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '이용 약관 동의',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post('agreements')
  @UseGuards(AccessTokenGuard)
  postUsersAgreements(@GetUser() user: PassportUser, @Body() createAgreementDto: CreateAgreementDto): Promise<void> {
    return this.usersService.createAgreement(user.sub, createAgreementDto);
  }

  @ApiOperation({
    summary: '이용 약관 동의 목록 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        id: 1,
        service: true,
        privacy: false,
        age: false,
        marketing: true,
        createdAt: '2023-01-20T21:37:26.886Z',
        updatedAt: '2023-01-20T21:37:26.886Z',
      },
    },
  })
  @Get('agreements')
  @UseGuards(AccessTokenGuard)
  getUsersAgreements(@GetUser() user: PassportUser): Promise<UserAgreement> {
    return this.usersService.getAgreementByUserId(user.sub);
  }

  @ApiOperation({
    summary: '결제 내역 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        orders: [
          { id: 1, productId: 1, totalAmount: 5000, couponTypeId: null, createdAt: '2023-01-20T21:37:26.886Z' },
          { id: 1, productId: 1, totalAmount: 0, couponTypeId: 2, createdAt: '2023-01-20T21:37:26.886Z' },
        ],
      },
    },
  })
  @Get('orders')
  @UseGuards(AccessTokenGuard)
  getUsersOrders(@GetUser() user: PassportUser): Promise<{ orders: UserOrder[] }> {
    return this.usersService.getOrdersByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저의 팀ID 조회',
    description: '팀(매칭 신청 정보)이 없는 경우 null 반환',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teamId: 1,
      },
    },
  })
  @Get('team-id')
  @UseGuards(AccessTokenGuard)
  getUsersTeamId(@GetUser() user: PassportUser): Promise<{ teamId: number }> {
    return this.usersService.getTeamIdByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저 매칭 상태 조회',
    description:
      '매칭 신청 전인 경우 matchingStatus: null \n\n matchingStatus: APPLIED / FAILED / MATCHED / OURTEAM_ACCEPTED / SUCCEEDED / PARTNER_TEAM_REFUSED / OURTEAM_REFUSED / NOT_RESPONDED',
  })
  @ApiOkResponse({
    content: {
      'application/json': {
        examples: {
          '매칭 신청 전': {
            value: { matchingStatus: null },
            description: '페이지: 매칭조회2',
          },
          '매칭 신청 완료': {
            value: { matchingStatus: MatchingStatus.APPLIED },
            description: '페이지: 매칭조회3',
          },
          '매칭 실패': {
            value: { matchingStatus: MatchingStatus.FAILED },
            description: '페이지: 매칭조회4',
          },
          '매칭 완료': {
            value: { matchingStatus: MatchingStatus.MATCHED },
            description: '페이지: 매칭조회5',
          },
          '우리팀 수락': {
            value: { matchingStatus: MatchingStatus.OURTEAM_ACCEPTED },
            description: '페이지: 매칭조회6',
          },
          '매칭 성공 (상호 수락)': {
            value: { matchingStatus: MatchingStatus.SUCCEEDED },
            description: '페이지: 매칭조회7',
          },
          '상대팀 거절': {
            value: { matchingStatus: MatchingStatus.PARTNER_TEAM_REFUSED },
            description: '페이지: 매칭조회8',
          },
          '우리팀 거절': {
            value: { matchingStatus: MatchingStatus.OURTEAM_REFUSED },
            description: '페이지: 매칭조회11',
          },
          무응답: {
            value: { matchingStatus: MatchingStatus.NOT_RESPONDED },
            description: '페이지: 매칭조회12',
          },
        },
      },
    },
  })
  @Get('matchings/status')
  @UseGuards(AccessTokenGuard)
  getUsersMatchingStatus(@GetUser() user: PassportUser): Promise<{ matchingStatus: MatchingStatus }> {
    return this.usersService.getUserMatchingStatusByUserId(user.sub);
  }
}
