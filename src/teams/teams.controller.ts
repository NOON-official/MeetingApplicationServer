/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';
import { Controller, Get, Post, Patch, Delete, Put } from '@nestjs/common';

@ApiTags('TEAM')
@Controller('teams')
export class TeamsController {
  @ApiOperation({
    summary: '주간 사용자 수 조회',
    description: '팀 수 * 멤버 수',
  })
  @Get('members/count/oneWeek')
  getTeamsMembersCountOneWeek() {}

  @ApiOperation({
    summary: '현재 신청팀 수 조회',
    description: '실패한 팀 포함, maxTeam: 성별 당 최대 팀 수',
  })
  @Get('count')
  getTeamsCount() {}

  @ApiOperation({
    summary: '팀 메타데이터 가져오기',
    description: '우리팀: 성별, 학교, 지역, MBTI, 포지션 \n\n 상대팀: 상대팀 학교, 분위기',
  })
  @Get('count')
  getTeamsMetadata() {}

  @ApiOperation({
    summary: '매칭 신청 (팀 정보 저장)',
  })
  @Post()
  postTeams() {}

  @ApiOperation({
    summary: '매칭 신청 정보 수정',
  })
  @Patch('/:teamId')
  patchTeamsTeamId() {}

  @ApiOperation({
    summary: '매칭 중단하기',
  })
  @Delete('/:teamId')
  deleteTeamsTeamId() {}

  @ApiOperation({
    summary: '매칭 신청 정보 조회',
    description: '본인팀, 상대팀 ID로만 조회 가능 \n\n startRound, currentRound로 매칭 실패/매칭중 판단 필요',
  })
  @Get('/:teamId')
  getTeamsTeamId() {}

  @ApiOperation({
    summary: '재매칭하기 /기존 정보로 매칭 시작하기',
    description: '기존 팀정보는 delete처리 \n\n 관리자페이지에서 카톡방 생성 여부와는 별개',
  })
  @Post(':teamId/reapply')
  postTeamsTeamIdReapply() {}

  @ApiOperation({
    summary: '팀의 매칭ID 조회',
    description: '매칭 정보가 없는 경우 null 반환',
  })
  @Get('/:teamId')
  getTeamsTeamIdMatchingId() {}

  @ApiOperation({
    summary: '신청자 조회',
    description: '관리자페이지 내 사용',
  })
  @Get()
  getTeams() {}

  @ApiOperation({
    summary: '삭제 적용(매칭 실패 처리)',
    description: '관리자페이지 내 사용 \n\n currentRount = startRound + 3',
  })
  @Put()
  putTeamsTeamIdFail() {}
}
