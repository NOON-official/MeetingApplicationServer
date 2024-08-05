import { MatchingOwnerGuard } from 'src/auth/guards/matching-owner.guard';
import { TeamOwnerGuard } from 'src/auth/guards/team-owner.guard';

import { Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Body, Param, Put } from '@nestjs/common/decorators';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PassportUser } from '../auth/interfaces/passport-user.interface';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateTeamDto } from './dtos/create-team.dto';
import { GetTeamDetailDto, GetTeamDto } from './dtos/get-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('TEAM')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  // @ApiOperation({
  //   summary: '주간 사용자 수 조회',
  //   description: '최근 일주일 간 팀 수 * 멤버 수',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       memberCount: 1000,
  //     },
  //   },
  // })
  // @Get('members/count/one-week')
  // getTeamsMembersCountOneWeek(): Promise<{ memberCount: number }> {
  //   return this.teamsService.getMembersCountOneWeek();
  // }

  @ApiOperation({
    summary: '누적 사용자 수 조회',
    description: '전체 기간 팀 수 * 멤버 수',
  })
  @ApiOkResponse({
    schema: {
      example: {
        memberCount: 1000,
      },
    },
  })
  @Get('members/count/total')
  getTeamsMembersCountTotal(): Promise<{ userCount: number }> {
    return this.teamsService.getMembersCountTotal();
  }

  // @ApiOperation({
  //   summary: '현재 신청팀 수 조회',
  //   description: '매칭 실패 횟수 3회 미만인 팀 포함 \n\n 최소 팀 수: 3, 최대 팀 수: 10',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       teamsPerRound: 10,
  //       '2vs2': {
  //         male: 8,
  //         female: 6,
  //       },
  //       '3vs3': {
  //         male: 4,
  //         female: 5,
  //       },
  //     },
  //   },
  // })
  // @Get('count')
  // async getTeamsCount(): Promise<{
  //   teamsPerRound: number;
  //   '2vs2': { male: number; female: number };
  //   '3vs3': { male: number; female: number };
  // }> {
  //   return this.teamsService.getTeamCount();
  // }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '팀 페이지데이터 가져오기',
  //   description:
  //     '성별, 학교, 지역, MBTI, 포지션, 상대팀 학교, 분위기 반환 \n\n 반환 프로퍼티 이름: Genders, Universities, Areas, Mbties, Roles, SameUniversities, Vibes',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       Genders,
  //       Universities,
  //       Areas,
  //       Mbties,
  //       Roles,
  //       SameUniversities,
  //       Vibes,
  //     },
  //   },
  // })
  // @Get('pagedata')
  // @UseGuards(AccessTokenGuard)
  // getTeamsPagedata(): Promise<{
  //   Genders: teamPagedata[];
  //   Universities: teamPagedata[];
  //   Areas: teamPagedata[];
  //   Mbties: teamPagedata[];
  //   Roles: teamPagedata[];
  //   SameUniversities: teamPagedata[];
  //   Vibes: teamPagedata[];
  // }> {
  //   return this.teamsService.getTeamPagedata();
  // }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 신청 (팀 정보 저장)',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postTeams(@Body() createTeamDto: CreateTeamDto, @GetUser() user: PassportUser): Promise<void> {
    return this.teamsService.createTeam(createTeamDto, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 신청 정보 수정',
    description:
      'request body에 수정이 필요한 프로퍼티만 보내주시면 됩니다 \n\n * ex) members 프로퍼티가 수정된 경우 members 프로퍼티 전체 정보가 필요함 \n\n 이미 매칭 완료된 팀인 경우 OR 매칭 실패한 팀인 경우 수정 불가',
  })
  @ApiOkResponse({ description: 'OK' })
  @Patch(':teamId')
  @UseGuards(AccessTokenGuard, TeamOwnerGuard)
  patchTeamsTeamId(
    @GetUser() _user: PassportUser,
    @Param('teamId') teamId: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<void> {
    return this.teamsService.updateTeam(teamId, updateTeamDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 중단하기',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete(':teamId')
  @UseGuards(AccessTokenGuard, TeamOwnerGuard)
  deleteTeamsTeamId(@GetUser() _user: PassportUser, @Param('teamId') teamId: number): Promise<void> {
    return this.teamsService.stopMatchingByTeamId(teamId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 신청 정보 조회',
    description: '모든팀 정보 조회 가능',
  })
  @ApiOkResponse({
    type: GetTeamDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get(':teamId')
  @UseGuards(AccessTokenGuard)
  getTeamsTeamId(@GetUser() _user: PassportUser, @Param('teamId') teamId: number): Promise<GetTeamDto> {
    return this.teamsService.getApplicationTeamById(teamId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '팀 연락처 조회',
    description: '본인팀 또는 매칭 상호 수락 후 상대팀 연락처 조회 가능',
  })
  @ApiOkResponse({
    type: GetTeamDetailDto,
  })
  @Get(':teamId/contact')
  @UseGuards(AccessTokenGuard, MatchingOwnerGuard)
  getTeamsTeamIdContact(@GetUser() _user: PassportUser, @Param('teamId') teamId: number): Promise<GetTeamDetailDto> {
    return this.teamsService.getApplicationTeamDetailById(teamId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: '매칭 다시 안 보기',
    description:
      '다시 안 보기 당한 팀ID를 파라미터로 보내주시면 됩니다.\n\n팀 테이블 excludedTeamIds에 상호 팀ID 추가 및 이후 추천 안됨',
  })
  @ApiOkResponse({ description: 'OK' })
  @Put(':excludedTeamId')
  @UseGuards(AccessTokenGuard)
  putMatchingsAppliedTeamIdExcludedTeamId(
    @GetUser() user: PassportUser,
    @Param('excludedTeamId') excludedTeamId: number,
  ): Promise<void> {
    return this.teamsService.updateExcludedTeamsByUserIdAndExcludedTeamId(user.sub, excludedTeamId);
  }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '재매칭하기/기존 정보로 매칭 시작하기',
  //   description: '기존 팀정보는 delete처리 \n\n 관리자페이지에서 카톡방 생성 여부와는 별개',
  // })
  // @ApiCreatedResponse({ description: 'Created' })
  // @Post(':teamId/reapply')
  // @UseGuards(AccessTokenGuard, TeamOwnerGuard)
  // postTeamsTeamIdReapply(@GetUser() _user: PassportUser, @Param('teamId') teamId: number): Promise<void> {
  //   return this.teamsService.reapplyTeam(teamId);
  // }

  // @ApiBearerAuth()
  // @ApiOperation({
  //   summary: '팀의 매칭ID 조회',
  //   description: '매칭 정보가 없는 경우 null 반환',
  // })
  // @ApiOkResponse({
  //   schema: {
  //     example: {
  //       matchingId: 1,
  //     },
  //   },
  // })
  // @Get(':teamId/matching-id')
  // @UseGuards(AccessTokenGuard, TeamOwnerGuard)
  // getTeamsTeamIdMatchingId(
  //   @GetUser() _user: PassportUser,
  //   @Param('teamId') teamId: number,
  // ): Promise<{ matchingId: number }> {
  //   return this.teamsService.getMatchingIdByTeamId(teamId);
  // }
}
