import { UpdateMatchingRefuseReasonDto } from './dtos/update-matching-refuse-reason.dto';
import { MatchingsService } from './matchings.service';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';
import { Body, Controller, Get, Param, Post, Put, UseGuards, Patch } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GetMatchingDto } from './dtos/get-matching.dto';
import { CreateMatchingRefuseReasonDto } from './dtos/create-matching-refuse-reason.dto';
import { MatchingOwnerGuard } from 'src/auth/guards/matching-owner.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PassportUser } from 'src/auth/interfaces/passport-user.interface';
@ApiTags('MATCHING')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('matchings')
export class MatchingsController {
  constructor(private matchingsService: MatchingsService) {}

  @ApiOperation({
    summary: '매칭 정보 조회',
    description:
      '매칭 정보가 없는 경우 null 반환 \n\n createdAt 기준 24시간 이상 초과 & 상대팀 무응답인 경우 -> 거절당함 페이지 \n\n createdAt 기준 24시간 이상 초과 & 상대팀 거절인 경우 -> 거절당함 페이지',
  })
  @ApiOkResponse({
    type: GetMatchingDto,
  })
  @Get(':matchingId')
  @UseGuards(AccessTokenGuard, MatchingOwnerGuard)
  getMatchingsMatchingId(
    @GetUser() user: PassportUser,
    @Param('matchingId') matchingId: number,
  ): Promise<GetMatchingDto> {
    return this.matchingsService.getMatchingInfoById(user.sub, matchingId);
  }

  @ApiOperation({
    summary: '매칭 수락하기',
    description:
      '이용권 1개 차감 \n\n 추후 상대팀이 거절한 경우 이용권 환불됨 \n\n 상대팀이 이미 거절한 경우/이용권이 없는 경우 400에러 발생',
  })
  @ApiOkResponse({ description: 'OK' })
  @Put(':matchingId/teams/:teamId/accept')
  @UseGuards(AccessTokenGuard, MatchingOwnerGuard)
  putMatchingsMatchingIdTeamsTeamIdAccept(
    @GetUser() user: PassportUser,
    @Param('matchingId') matchingId: number,
    @Param('teamId') teamId: number,
  ): Promise<void> {
    return this.matchingsService.acceptMatchingByTeamId(user.sub, matchingId, teamId);
  }

  @ApiOperation({
    summary: '매칭 거절하기',
    description: '상대팀 이용권 환불 필요',
  })
  @ApiOkResponse({ description: 'OK' })
  @Put(':matchingId/teams/:teamId/refuse')
  @UseGuards(AccessTokenGuard, MatchingOwnerGuard)
  putMatchingsMatchingIdTeamsTeamIdRefuse(
    @Param('matchingId') matchingId: number,
    @Param('teamId') teamId: number,
  ): Promise<void> {
    return this.matchingsService.refuseMatchingByTeamId(matchingId, teamId);
  }

  @ApiOperation({
    summary: '매칭 거절 이유 보내기',
    description:
      '매칭 결과 조회 페이지에서 [거절하기] 버튼 클릭 시 default value 상태로 해당 API를 호출해주시면 됩니다. (데이터베이스 내 row 생성 용도)',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post(':matchingId/teams/:teamId/refuse-reason')
  @UseGuards(AccessTokenGuard, MatchingOwnerGuard)
  postMatchingsMatchingIdTeamsTeamIdRefuseReason(
    @Param('matchingId') matchingId: number,
    @Param('teamId') teamId: number,
    @Body() createMatchingRefuseReasonDto: CreateMatchingRefuseReasonDto,
  ): Promise<void> {
    return this.matchingsService.createMatchingRefuseReason(matchingId, teamId, createMatchingRefuseReasonDto);
  }

  @ApiOperation({
    summary: '매칭 거절 이유 수정하기',
    description:
      '유저가 매칭 거절 이유 선택 후 [결과 보내기] 버튼 클릭 시 해당 API를 호출해주시면 됩니다. \n\n * request body에 수정이 필요한 프로퍼티만 보내주시면 됩니다.',
  })
  @ApiOkResponse({ description: 'OK' })
  @Patch(':matchingId/teams/:teamId/refuse-reason')
  @UseGuards(AccessTokenGuard, MatchingOwnerGuard)
  patchMatchingsMatchingIdTeamsTeamIdRefuseReason(
    @Param('matchingId') matchingId: number,
    @Param('teamId') teamId: number,
    @Body() updateMatchingRefuseReasonDto: UpdateMatchingRefuseReasonDto,
  ): Promise<void> {
    return this.matchingsService.updateMatchingRefuseReason(matchingId, teamId, updateMatchingRefuseReasonDto);
  }
}
