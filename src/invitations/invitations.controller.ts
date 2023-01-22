import { Delete, Param } from '@nestjs/common';
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
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CreateInvitationDto } from './dtos/create-invitation.dto';

@ApiTags('INVITATION')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('invitations')
export class InvitationsController {
  @ApiOperation({
    summary: '회원 초대 코드 입력',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postInvitations(@Body() createInvitationDto: CreateInvitationDto) {}

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
  @Get('/users/success')
  @UseGuards(AccessTokenGuard)
  getInvitationsUsersSuccess() {}

  @ApiOperation({
    summary: '친구초대 4명 달성 유저 삭제',
    description: '관리자페이지 내 사용 \n\n 커피쿠폰 지급 완료 유저 삭제',
  })
  @ApiOkResponse({ description: 'OK' })
  @Delete('/users/:userId/success')
  @UseGuards(AccessTokenGuard)
  deleteInvitationsUsersSuccess(@Param('userId') userId: number) {}
}
