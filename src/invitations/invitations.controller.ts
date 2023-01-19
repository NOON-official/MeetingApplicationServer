/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger/dist';
import { Controller, Post } from '@nestjs/common';

@ApiTags('INVITATION')
@Controller('invitations')
export class InvitationsController {
  @ApiOperation({
    summary: '회원 초대 코드 입력',
  })
  @Post()
  postInvitations() {}
}
