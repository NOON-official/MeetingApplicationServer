import { GetTeamDto } from './dtos/get-team.dto';
import { CreateTeamDto } from './dtos/create-team.dto';
import { Vibes } from './constants/Vibes';
import { SameUniversities } from './constants/SameUniversities';
import { Roles } from './constants/Roles';
import { Mbties } from './constants/Mbties';
import { Areas } from './constants/Areas';
import { Genders } from './constants/Genders';
import { Universities } from './constants/Universities';
import { TeamGender } from './entities/team-gender.enum';
import { TeamStatus } from './entities/team-status.enum';
import { AccessTokenGuard } from './../auth/guards/access-token.guard';
import { Param, Query, Body } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger/dist';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';
import { Controller, Get, Post, Patch, Delete, Put, UseGuards } from '@nestjs/common';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { Team } from './entities/team.entity';

@ApiTags('TEAM')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('teams')
export class TeamsController {
  @ApiOperation({
    summary: '주간 사용자 수 조회',
    description: '팀 수 * 멤버 수',
  })
  @ApiOkResponse({
    schema: {
      example: {
        memberCount: 1000,
      },
    },
  })
  @Get('members/count/oneWeek')
  getTeamsMembersCountOneWeek() {}

  @ApiOperation({
    summary: '현재 신청팀 수 조회',
    description: '매칭 실패 횟수 3회 미만인 팀 포함',
  })
  @ApiQuery({ name: 'status', enum: [TeamStatus.applied] })
  @ApiQuery({ name: 'membercount', enum: ['2', '3'] })
  @ApiQuery({ name: 'gender', enum: TeamGender })
  @ApiOkResponse({
    schema: {
      example: {
        teamCount: 8,
      },
    },
  })
  @Get('count')
  getTeamsCount(
    @Query('status') status: TeamStatus.applied,
    @Query('membercount') membercount: '2' | '3',
    @Query('gender') gender: TeamGender,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '팀 메타데이터 가져오기',
    description:
      '성별, 학교, 지역, MBTI, 포지션, 상대팀 학교, 분위기 반환 \n\n 반환 프로퍼티 이름: Genders, Universities, Areas, Mbties, Roles, SameUniversities, Vibes',
  })
  @ApiOkResponse({
    schema: {
      example: {
        Genders,
        Universities,
        Areas,
        Mbties,
        Roles,
        SameUniversities,
        Vibes,
      },
    },
  })
  @Get('metadata')
  @UseGuards(AccessTokenGuard)
  getTeamsMetadata() {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 신청 (팀 정보 저장)',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postTeams(@Body() createTeamDto: CreateTeamDto) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 신청 정보 수정',
    description: 'request body에 수정이 필요한 프로퍼티만 보내주시면 됩니다',
  })
  @ApiOkResponse({ description: 'OK' })
  @Patch('/:teamId')
  @UseGuards(AccessTokenGuard)
  patchTeamsTeamId(@Param('teamId') teamId: number, @Body() updateTeamDto: UpdateTeamDto) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 중단하기',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('/:teamId')
  @UseGuards(AccessTokenGuard)
  deleteTeamsTeamId(@Param('teamId') teamId: number) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 신청 정보 조회',
    description: '본인팀, 상대팀 ID로만 조회 가능 \n\n startRound, currentRound로 매칭 실패/매칭중 판단 필요',
  })
  @ApiOkResponse({
    type: GetTeamDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get('/:teamId')
  @UseGuards(AccessTokenGuard)
  getTeamsTeamId(@Param('teamId') teamId: number) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '재매칭하기/기존 정보로 매칭 시작하기',
    description: '기존 팀정보는 delete처리 \n\n 관리자페이지에서 카톡방 생성 여부와는 별개',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post(':teamId/reapply')
  @UseGuards(AccessTokenGuard)
  postTeamsTeamIdReapply(@Param('teamId') teamId: number) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '팀의 매칭ID 조회',
    description: '매칭 정보가 없는 경우 null 반환',
  })
  @ApiOkResponse({
    schema: {
      example: {
        matchingId: 1,
      },
    },
  })
  @Get('/:teamId/matching-id')
  @UseGuards(AccessTokenGuard)
  getTeamsTeamIdMatchingId(@Param('teamId') teamId: number) {}

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
  @Get()
  @UseGuards(AccessTokenGuard)
  getTeams(
    @Query('status') status: TeamStatus,
    @Query('membercount') membercount: '2' | '3',
    @Query('gender') gender: TeamGender,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: '삭제 적용(매칭 실패 처리) -- 보류',
    description: '관리자페이지 내 사용 \n\n currentRount = startRound + 3',
  })
  @Put(':teamId/fail')
  @UseGuards(AccessTokenGuard)
  putTeamsTeamIdFail() {}
}
