import { InvitationSucceededEvent } from './events/invitation-succeeded.event';
import { BadRequestException } from '@nestjs/common/exceptions';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { InvitationsRepository } from './repositories/invitations.repository';
import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvitationCreatedEvent } from './events/invitation-created.event';
import { AdminGetInvitationSuccessUserDto } from 'src/admin/dtos/admin-get-invitation-success-user.dto';
import { INVITATION_SUCCESS_COUNT, INVITATION_TINGS_COUNT } from './constants/invitation-success-count.constant';
import { TingsService } from 'src/tings/tings.service';

@Injectable()
export class InvitationsService {
  constructor(
    private invitationsRepository: InvitationsRepository,
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => TingsService))
    private tingsService: TingsService,
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

    // 회원을 초대한 유저에게 팅 3개 지급
    const invitationCreatedEvent = new InvitationCreatedEvent();
    invitationCreatedEvent.inviteeId = invitee.id;
    this.eventEmitter.emit('invitation.created', invitationCreatedEvent);

    await this.tingsService.refundTingByUserIdAndTingCount(inviter.id, INVITATION_TINGS_COUNT);
    await this.tingsService.refundTingByUserIdAndTingCount(invitee.id, INVITATION_TINGS_COUNT);

    // 초대 내역 저장
    await this.invitationsRepository.createInvitation(inviter, invitee);

    const invitationSucceededEvent = new InvitationSucceededEvent();
    invitationSucceededEvent.inviterId = inviter.id;
    this.eventEmitter.emit('invitation.succeeded', invitationSucceededEvent);
  }

  async getInvitationCountByUserId(userId: number): Promise<{ invitationCount: number }> {
    await this.usersService.getUserById(userId);

    return await this.invitationsRepository.getInvitationCountByUserId(userId);
  }

  async getInvitationCountWithDeletedByUserId(userId: number): Promise<{ invitationCount: number }> {
    await this.usersService.getUserById(userId);

    return await this.invitationsRepository.getInvitationCountWithDeletedByUserId(userId);
  }

  async getUsersWithInvitationCount(): Promise<{ users: AdminGetInvitationSuccessUserDto[] }> {
    return await this.invitationsRepository.getUsersWithInvitationCount();
  }

  async deleteInvitationSuccessByUserId(userId: number): Promise<void> {
    const { invitationCount } = await this.getInvitationCountByUserId(userId);

    // 삭제할 invitation 개수
    const deleteLimit = Math.floor(invitationCount / INVITATION_SUCCESS_COUNT) * INVITATION_SUCCESS_COUNT;

    // 해당 개수만큼 삭제
    await this.invitationsRepository.deleteInvitationSuccessByUserIdAndDeleteLimit(userId, deleteLimit);
  }

  async deleteInvitationsByUserId(userId: number): Promise<void> {
    return this.invitationsRepository.deleteInvitationsByUserId(userId);
  }
}
