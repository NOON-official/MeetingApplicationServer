/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GetMatchingsDto } from 'src/matchings/dtos/get-matchings.dto';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { TeamStatus } from 'src/teams/entities/team-status.enum';

@ApiTags('ADMIN')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('admin')
export class AdminController {
  @ApiOperation({
    summary: '유저 전체 조회',
    description: '관리자 페이지 내 사용',
  })
  @ApiOkResponse({
    schema: {
      example: {
        users: [
          {
            id: 1,
            nickname: '미팅이1',
            status: '신청대기',
            phone: '01012345678',
            createdAt: '2023-01-2023-01-20T21:37:26.886Z',
            referralId: 'LD4GSTO3',
            ticketCount: 5,
            discount50CouponCount: 1,
            freeCouponCount: 0,
          },
          {
            id: 1,
            nickname: '미팅이2',
            status: '진행중',
            phone: '01012345678',
            createdAt: '2023-01-2023-01-20T21:37:26.886Z',
            referralId: 'LD4GSTO3',
            ticketCount: 5,
            discount50CouponCount: 1,
            freeCouponCount: 0,
          },
        ],
      },
    },
  })
  @Get('users')
  @UseGuards(AccessTokenGuard)
  getAdminUsers() {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '신청자 조회',
    description:
      '관리자페이지 내 사용 \n\n 아직 매칭되지 않은 경우 partnerTeamId와 matchedAt은 null 반환 \n\n 거절당하지 않은 경우 refusedAt은 null 반환',
  })
  @ApiQuery({ name: 'status', enum: TeamStatus })
  @ApiQuery({ name: 'membercount', enum: ['2', '3'] })
  @ApiQuery({ name: 'gender', enum: TeamGender })
  @ApiOkResponse({
    schema: {
      example: {
        teams: [
          {
            id: 1,
            ownerId: 1,
            intro: '안녕하세요',
            currentRound: 1,
            createdAt: '2023-01-20T21:37:26.886Z',
            nickname: '미팅이1',
            phone: '01012345678',
            partnerTeamId: 1,
            matchedAt: '2023-01-20T21:37:26.886Z',
            refusedAt: '2023-01-20T21:37:26.886Z',
          },
          {
            id: 2,
            ownerId: 3,
            intro: '안녕하세요',
            currentRound: 1,
            createdAt: '2023-01-20T21:37:26.886Z',
            nickname: '미팅이2',
            phone: '01012345678',
            partnerTeamId: null,
            matchedAt: null,
            refusedAt: null,
          },
        ],
      },
    },
  })
  @Get('teams')
  @UseGuards(AccessTokenGuard)
  getAdminTeams(
    @Query('status') status: TeamStatus,
    @Query('membercount') membercount: '2' | '3',
    @Query('gender') gender: TeamGender,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '삭제 적용(매칭 실패 처리) -- 보류',
    description: '관리자페이지 내 사용 \n\n currentRount = startRound + 3',
  })
  @Put('teams/:teamId/fail')
  @UseGuards(AccessTokenGuard)
  putAdminTeamsTeamIdFail() {}

  @ApiOperation({
    summary: '친구초대 4명 달성 유저 조회 --- 보류',
    description: '관리자페이지 내 사용 \n\n 커피쿠폰 미지급 상태인 유저만 조회',
  })
  @ApiOkResponse({
    schema: {
      example: {
        users: [{ id: 1, userId: 2, nickname: '미팅이', phone: '01012345678', createdAt: '2023-01-20T21:37:26.886Z' }],
      },
    },
  })
  @Get('invitations/users/success')
  @UseGuards(AccessTokenGuard)
  getInvitationsUsersSuccess() {}

  @ApiOperation({
    summary: '친구초대 4명 달성 유저 삭제',
    description: '관리자페이지 내 사용 \n\n 커피쿠폰 지급 완료 유저 삭제',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('invitations/users/:userId/success')
  @UseGuards(AccessTokenGuard)
  deleteInvitationsUsersSuccess(@Param('userId') userId: number) {}

  @ApiOperation({
    summary: '매칭 적용(매칭 알고리즘)',
    description: '관리자페이지 내 사용',
  })
  @ApiOkResponse({ description: 'OK' })
  @Post('matchings')
  @UseGuards(AccessTokenGuard)
  postMatchings() {}

  @ApiOperation({
    summary: '매칭완료자 조회',
    description: '관리자페이지 내 사용',
  })
  @ApiOkResponse({
    type: [GetMatchingsDto],
  })
  @Get('matchings')
  @UseGuards(AccessTokenGuard)
  getMatchings() {}

  @ApiOperation({
    summary: '채팅방 생성 완료 일시 저장',
    description: '관리자페이지 내 사용',
  })
  @ApiOkResponse({ description: 'OK' })
  @Put('matchings/:matchingId/chat')
  @UseGuards(AccessTokenGuard)
  putMatchingsMatchingIdChat(@Param('matchingId') matchingId: number) {}

  @ApiOperation({
    summary: '매칭 삭제하기',
    description: '관리자페이지-매칭완료자에서 사용 \n\n',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('matchings/:matchingId')
  @UseGuards(AccessTokenGuard)
  deleteMatchingMatchingId(@Param('matchingId') matchingId: number) {}
}
