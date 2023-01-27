import { UserTeam } from './interfaces/user-team.interface';
import { CreateAgreementDto } from './dtos/create-agreement.dto';
import { UpdatePhoneDto } from './dtos/update-phone.dto';
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
  getUsersInvitationsCount(@GetUser() user: PassportUser) {
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
  getUsersReferralId(@GetUser() user: PassportUser) {
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
  getUsersMyInfo(@GetUser() user: PassportUser) {
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
  getUsersTeams(@GetUser() user: PassportUser): Promise<{ teams: Array<UserTeam> }> {
    return this.usersService.getTeamsByUserId(user.sub);
  }

  @ApiOperation({
    summary: '전화번호 변경',
  })
  @ApiOkResponse({
    schema: {
      example: {
        phone: '01012345678',
      },
    },
  })
  @Put('phone')
  @UseGuards(AccessTokenGuard)
  putUsersPhone(@GetUser() user: PassportUser, @Body() updatePhoneDto: UpdatePhoneDto): Promise<void> {
    return this.usersService.updateUserPhone(user.sub, updatePhoneDto);
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
  getUsersTicketsCount(@GetUser() user: PassportUser) {}

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
  getUsersCouponsCount(@GetUser() user: PassportUser) {}

  @ApiOperation({
    summary: '보유 쿠폰 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        coupons: [
          { id: 1, type: 1, expiresAt: '2023-01-22' },
          { id: 2, type: 2, expiresAt: '2023-01-22' },
        ],
      },
    },
  })
  @Get('coupons')
  @UseGuards(AccessTokenGuard)
  getUsersCoupons(@GetUser() user: PassportUser) {}

  @ApiOperation({
    summary: '이용 약관 동의',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post('agreements')
  @UseGuards(AccessTokenGuard)
  postUsersAgreements(@GetUser() user: PassportUser, @Body() createAgreementDto: CreateAgreementDto) {}

  @ApiOperation({
    summary: '이용 약관 동의 목록 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        agreements: {
          service: true,
          privacy: false,
          age: false,
          marketing: true,
          createdAt: '2023-01-20T21:37:26.886Z',
          updatedAt: '2023-01-20T21:37:26.886Z',
        },
      },
    },
  })
  @Get('agreements')
  @UseGuards(AccessTokenGuard)
  getUsersAgreements(@GetUser() user: PassportUser) {}

  @ApiOperation({
    summary: '결제 내역 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        orders: [
          { id: 1, type: 1, amount: 5000, couponId: null, createdAt: '2023-01-2023-01-20T21:37:26.886Z' },
          { id: 2, type: 1, amount: 0, couponId: 1, createdAt: '2023-01-2023-01-20T21:37:26.886Z' },
        ],
      },
    },
  })
  @Get('orders')
  @UseGuards(AccessTokenGuard)
  getUsersOrders(@GetUser() user: PassportUser) {}

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
  getUsersTeamId(@GetUser() user: PassportUser) {}
}
