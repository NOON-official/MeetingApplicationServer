import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';

import { PassportUser } from '../auth/interfaces/passport-user.interface';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@ApiTags('INVITATION')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'Not Found' })
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @ApiOperation({
    summary: '회원 초대 코드 입력',
  })
  @ApiCreatedResponse({ description: 'Created' })
  @Post()
  @UseGuards(AccessTokenGuard)
  postInvitations(@GetUser() user: PassportUser, @Body() createInvitationDto: CreateInvitationDto): Promise<void> {
    return this.invitationsService.createInvitation(user.sub, createInvitationDto);
  }
}
