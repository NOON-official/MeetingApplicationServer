import { PassportUser } from './../auth/interfaces/passport-user.interface';
import { InvitationsService } from './invitations.service';
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { GetUser } from 'src/common/get-user.decorator';

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
  postInvitations(@GetUser() user: PassportUser, @Body() createInvitationDto: CreateInvitationDto) {
    return this.invitationsService.createInvitation(user.sub, createInvitationDto);
  }
}
