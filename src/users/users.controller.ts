import { PassportUser } from 'src/auth/interfaces/passport-user.interface';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { GetTeamCardDto } from 'src/teams/dtos/get-team-card.dto';

import { Controller, Get, UseGuards } from '@nestjs/common';
import { Body, Delete, Patch, Post } from '@nestjs/common/decorators';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateAgreementDto } from './dtos/create-agreement.dto';
import { GetUserTingHistoryDto } from './dtos/get-user.dto';
import { UpdateUniversityDto, UpdateUserDto } from './dtos/update-user.dto';
import { UserAgreement } from './entities/user-agreement.entity';
import { UserCoupon } from './interfaces/user-coupon.interface';
import { UserOrder } from './interfaces/user-order.interface';
import { UsersService } from './users.service';

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
    description: '이름, 전화번호, 성별, 대학교, 출생년도 반환',
  })
  @ApiOkResponse({
    schema: {
      example: {
        nickname: '미팅이',
        phone: '01012345678',
        gender: 'male',
        university: 1,
        birth: 1996,
        isVerified: true,
        approval: true,
      },
    },
  })
  @Get('my-info')
  @UseGuards(AccessTokenGuard)
  getUsersMyInfo(@GetUser() user: PassportUser): Promise<{ nickname: string; phone: string }> {
    return this.usersService.getMyInfoByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저의 추가 정보 저장',
    description: '성별, 출생년도를 추가로 저장합니다.',
  })
  @ApiOkResponse({ description: 'OK' })
  @Patch('my-info')
  @UseGuards(AccessTokenGuard)
  patchUsersMyInfo(@GetUser() user: PassportUser, @Body() updateInfo: UpdateUserDto): Promise<void> {
    return this.usersService.updateUserInfo(user.sub, updateInfo);
  }

  @ApiOperation({
    summary: '유저의 대학교 정보 저장',
    description: '대학교를 추가로 저장합니다.',
  })
  @ApiOkResponse({ description: 'OK' })
  @Patch('university')
  @UseGuards(AccessTokenGuard)
  patchUsersUniversity(@GetUser() user: PassportUser, @Body() updateUniversity: UpdateUniversityDto): Promise<void> {
    return this.usersService.updateUniversity(user.sub, updateUniversity);
  }

  // @ApiOperation({
  //   summary: '신청 내역 조회',
  //   description: '인원수, 신청날짜 반환 \n\n chatCreatedAt이 null이 아닌 경우 "매칭 완료"로 표시해주세요.',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       teams: [
  //         { id: 1, memberCount: 2, createdAt: '2023-01-20T21:37:26.886Z', chatCreatedAt: '2023-01-20T21:37:26.886Z' },
  //         { id: 4, memberCount: 3, createdAt: '2023-01-20T21:37:26.886Z', chatCreatedAt: null },
  //       ],
  //     },
  //   },
  // })
  // @Get('teams')
  // @UseGuards(AccessTokenGuard)
  // getUsersTeams(@GetUser() user: PassportUser): Promise<{ teams: UserTeam[] }> {
  //   return this.usersService.getTeamsByUserId(user.sub);
  // }

  // @ApiOperation({
  //   summary: '미사용 이용권 개수 조회',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       ticketCount: 5,
  //     },
  //   },
  // })
  // @Get('tickets/count')
  // @UseGuards(AccessTokenGuard)
  // getUsersTicketsCount(@GetUser() user: PassportUser): Promise<{ ticketCount: number }> {
  //   return this.usersService.getTicketCountByUserId(user.sub);
  // }
  @ApiOperation({
    summary: '보유 팅 개수 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        tingCount: 5,
      },
    },
  })
  @Get('tings/count')
  @UseGuards(AccessTokenGuard)
  getUsersTicketsCount(@GetUser() user: PassportUser): Promise<{ tingCount: number }> {
    return this.usersService.getUserTingsCount(user.sub);
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
    summary: '유저 추천팀 조회',
    description: '* 유저의 팀 프로필이 없는 경우 400 에러 반환 \n\n* 추천할 팀이 없는 경우 빈 배열([]) 반환',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            id: 1,
            teamName: '기웅내세요',
            age: 24,
            memberCount: 3,
            intro: '안녕하세요',
            approval: true,
            createdAt: '2023-01-20T21:37:26.886Z',
          },
          {
            id: 2,
            teamName: '아름이와 아이들',
            age: 27,
            memberCount: 2,
            intro: '안녕하세요',
            approval: false,
            createdAt: '2023-01-20T21:37:26.886Z',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get('teams/recommended')
  @UseGuards(AccessTokenGuard)
  getUsersTeamsRecommended(@GetUser() user: PassportUser): Promise<{ teams: GetTeamCardDto[] }> {
    return this.usersService.getRecommendedTeamCardsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저 신청한 팀 조회 (보낸 신청 - 응답을 기다려요)',
    description: '',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            id: 1,
            matchingId: 1,
            teamName: '기웅내세요',
            age: 24,
            memberCount: 3,
            intro: '안녕하세요',
            approval: true,
            appliedAt: '2023-01-20T21:37:26.886Z',
          },
          {
            id: 2,
            matchingId: 3,
            teamName: '아름이와 아이들',
            age: 27,
            memberCount: 2,
            intro: '안녕하세요',
            approval: false,
            appliedAt: '2023-01-20T21:37:26.886Z',
          },
        ],
      },
    },
  })
  @Get('matchings/applied')
  @UseGuards(AccessTokenGuard)
  getUsersMatchingsApplied(@GetUser() user: PassportUser): Promise<{ teams: GetTeamCardDto[] }> {
    return this.usersService.getAppliedTeamCardsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저 거절당한 팀 조회 (보낸 신청 - 거절됐어요)',
    description: '',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            id: 1,
            matchingId: 1,
            teamName: '기웅내세요',
            age: 24,
            memberCount: 3,
            intro: '안녕하세요',
            approval: true,
            appliedAt: '2023-01-20T21:37:26.886Z',
          },
          {
            id: 2,
            matchingId: 3,
            teamName: '아름이와 아이들',
            age: 27,
            memberCount: 2,
            intro: '안녕하세요',
            approval: false,
            appliedAt: '2023-01-20T21:37:26.886Z',
          },
        ],
      },
    },
  })
  @Get('matchings/refused')
  @UseGuards(AccessTokenGuard)
  getUsersMatchingsRefused(@GetUser() user: PassportUser): Promise<{ teams: GetTeamCardDto[] }> {
    return this.usersService.getRefusedTeamCardsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저 신청받은 팀 조회 (받은 신청)',
    description: '',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            id: 1,
            matchingId: 1,
            teamName: '기웅내세요',
            age: 24,
            memberCount: 3,
            intro: '안녕하세요',
            approval: true,
            appliedAt: '2023-01-20T21:37:26.886Z',
          },
          {
            id: 2,
            matchingId: 2,
            teamName: '아름이와 아이들',
            age: 27,
            memberCount: 2,
            intro: '안녕하세요',
            approval: false,
            appliedAt: '2023-01-20T21:37:26.886Z',
          },
        ],
      },
    },
  })
  @Get('matchings/received')
  @UseGuards(AccessTokenGuard)
  getUsersMatchingsReceived(@GetUser() user: PassportUser): Promise<{ teams: GetTeamCardDto[] }> {
    return this.usersService.getReceivedTeamCardsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저 상호 수락 팀 조회 (매칭 완료)',
    description: '상호 수락일 기준 7일 이내 매칭 정보만 조회됩니다.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            id: 1,
            matchingId: 1,
            teamName: '기웅내세요',
            age: 24,
            memberCount: 3,
            intro: '안녕하세요',
            approval: true,
            matchedAt: '2023-01-20T21:37:26.886Z',
          },
          {
            id: 2,
            matchingId: 2,
            teamName: '아름이와 아이들',
            age: 27,
            memberCount: 2,
            intro: '안녕하세요',
            approval: false,
            matchedAt: '2023-01-20T21:37:26.886Z',
          },
        ],
      },
    },
  })
  @Get('matchings/succeeded')
  @UseGuards(AccessTokenGuard)
  getUsersMatchingsSucceeded(@GetUser() user: PassportUser): Promise<{ teams: GetTeamCardDto[] }> {
    return this.usersService.getSucceededTeamCardsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '유저 신청한 팀 삭제 (내가 신청)',
    description: '',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('matchings/applied')
  @UseGuards(AccessTokenGuard)
  deleteUsersMatchingsAppliedMatchingId(@GetUser() user: PassportUser, @Body() matchingIds: number[]): Promise<void> {
    return this.usersService.deleteMatchingByUserId(user.sub, matchingIds);
  }

  @ApiOperation({
    summary: '유저 신청받은 팀 삭제 (남이 신청)',
    description: '',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('matchings/received')
  @UseGuards(AccessTokenGuard)
  deleteUsersMatchingsReceivedMatchingId(@GetUser() user: PassportUser, @Body() matchingIds: number[]): Promise<void> {
    return this.usersService.deleteMatchingByUserId(user.sub, matchingIds);
  }

  @ApiOperation({
    summary: '유저 팅 지급 내역',
    description: '유저의 팅 사용내역 밑 지급내역 확인.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        tingHistoty: [
          {
            id: 1,
            case: '회원가입',
            usingTing: 20,
          },
          {
            id: 2,
            case: '미팅 수락',
            usingTing: -2,
          },
        ],
      },
    },
  })
  @Get('tings/history')
  @UseGuards(AccessTokenGuard)
  getUsersTingsHistrory(@GetUser() user: PassportUser): Promise<{ tingHistories: GetUserTingHistoryDto[] }> {
    return this.usersService.getUsersTingsHistrory(user.sub);
  }

  // @ApiOperation({
  //   summary: '유저 매칭 상태 조회',
  //   description:
  //     '매칭 신청 전인 경우 matchingStatus: null \n\n matchingStatus: APPLIED / FAILED / MATCHED / OURTEAM_ACCEPTED / SUCCEEDED / PARTNER_TEAM_REFUSED / OURTEAM_REFUSED / NOT_RESPONDED',
  // })
  // @ApiOkResponse({
  //   content: {
  //     'application/json': {
  //       examples: {
  //         '매칭 신청 전': {
  //           value: { matchingStatus: null },
  //           description: '페이지: 매칭조회2',
  //         },
  //         '매칭 신청 완료': {
  //           value: { matchingStatus: MatchingStatus.APPLIED },
  //           description: '페이지: 매칭조회3',
  //         },
  //         '매칭 실패': {
  //           value: { matchingStatus: MatchingStatus.FAILED },
  //           description: '페이지: 매칭조회4',
  //         },
  //         '매칭 완료': {
  //           value: { matchingStatus: MatchingStatus.MATCHED },
  //           description: '페이지: 매칭조회5',
  //         },
  //         '우리팀 수락': {
  //           value: { matchingStatus: MatchingStatus.OURTEAM_ACCEPTED },
  //           description: '페이지: 매칭조회6',
  //         },
  //         '매칭 성공 (상호 수락)': {
  //           value: { matchingStatus: MatchingStatus.SUCCEEDED },
  //           description: '페이지: 매칭조회7',
  //         },
  //         '상대팀 거절': {
  //           value: { matchingStatus: MatchingStatus.PARTNER_TEAM_REFUSED },
  //           description: '페이지: 매칭조회8',
  //         },
  //         '우리팀 거절': {
  //           value: { matchingStatus: MatchingStatus.OURTEAM_REFUSED },
  //           description: '페이지: 매칭조회11',
  //         },
  //         무응답: {
  //           value: { matchingStatus: MatchingStatus.NOT_RESPONDED },
  //           description: '페이지: 매칭조회12',
  //         },
  //       },
  //     },
  //   },
  // })
  // @Get('matchings/status')
  // @UseGuards(AccessTokenGuard)
  // getUsersMatchingStatus(@GetUser() user: PassportUser): Promise<{ matchingStatus: MatchingStatus }> {
  //   return this.usersService.getUserMatchingStatusByUserId(user.sub);
  // }
}
