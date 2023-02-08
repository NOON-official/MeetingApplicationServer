import { BadRequestException } from '@nestjs/common/exceptions';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { InvitationsRepository } from './repositories/invitations.repository';
import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvitationCreatedEvent } from './events/invitation-created.event';

@Injectable()
export class InvitationsService {
  constructor(
    private invitationsRepository: InvitationsRepository,
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createInvitation(userId: number, createInvitationDto: CreateInvitationDto): Promise<void> {
    // 추천인코드 확인
    const inviter = await this.usersService.getUserByReferralId(createInvitationDto.referralId);

    // 유저 확인
    const invitee = await this.usersService.getUserById(userId);

    if (inviter.id === invitee.id) {
      throw new ForbiddenException('invalid access');
    }

    const existingInvitation = await this.invitationsRepository.getInvitationByInviteeId(invitee.id);

    // 이미 회원 코드를 입력한 유저인 경우
    if (!!existingInvitation) {
      throw new BadRequestException('already invited user');
    }

    // 회원 코드 입력한 유저에게 1회 이용권 50% 할인 쿠폰 발급
    const invitationCreatedEvent = new InvitationCreatedEvent();
    invitationCreatedEvent.inviteeId = invitee.id;
    this.eventEmitter.emit('invitation.created', invitationCreatedEvent);

    return this.invitationsRepository.createInvitation(inviter, invitee);
  }

  async getInvitationCountByUserId(userId: number): Promise<{ invitationCount: number }> {
    await this.usersService.getUserById(userId);

    return await this.invitationsRepository.getInvitationCountByUserId(userId);
  }
}
