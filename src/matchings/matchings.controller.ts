/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';
import { Controller, Get, Post, Put } from '@nestjs/common';

@ApiTags('MATCHING')
@Controller('matchings')
export class MatchingsController {
  @ApiOperation({
    summary: '매칭 정보 조회',
    description:
      '매칭 정보가 없는 경우 null 반환 \n\n createdAt 기준 24시간 이상 초과 & 상대팀 무응답인 경우 -> 거절당함 페이지 \n\n createdAt 기준 24시간 이상 초과 & 상대팀 거절인 경우 -> 거절당함 페이지',
  })
  @Get(':matchingId')
  getMatchingsMatchingId() {}

  @ApiOperation({
    summary: '매칭 수락하기',
    description: '이용권 차감됨 \n\n 거절당한 경우 이용권 환불 필요',
  })
  @Put(':matchingId/teams/:teamId/accept')
  putMatchingsMatchingIdTeamsTeamIdAccept() {}

  @ApiOperation({
    summary: '매칭 거절하기',
    description: '상대팀 이용권 환불 필요',
  })
  @Put(':matchingId/teams/:teamId/refuse')
  putMatchingsMatchingIdTeamsTeamIdRefuse() {}

  @ApiOperation({
    summary: '매칭 거절 이유 보내기',
  })
  @Post(':matchingId/teams/:teamId/refuse-reason')
  postMatchingsMatchingIdTeamsTeamIdRefuseReason() {}

  @ApiOperation({
    summary: '매칭 적용(매칭 알고리즘)',
    description: '관리자페이지 내 사용',
  })
  @Post()
  postMatchings() {}

  @ApiOperation({
    summary: '나머지 적용',
    description:
      '관리자페이지 내 사용 \n\n createdAt 기준 24시간 이상 초과 & (무응답 | 거절) -> delete 처리 \n\n 클라이언트에서 페이지 전환 가능한 경우 해당 API 필요X',
  })
  @Put()
  putMatchings() {}

  @ApiOperation({
    summary: '매칭 완료 정보 조회',
    description: '관리자페이지 내 사용',
  })
  @Get()
  getMatchings() {}

  @ApiOperation({
    summary: '채팅방 생성 완료 여부 저장',
    description: '관리자페이지 내 사용',
  })
  @Put(':matchingId/chat')
  putMatchingsMatchingIdChat() {}
}
