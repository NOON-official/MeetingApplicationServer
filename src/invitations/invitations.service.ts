import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { InvitationsRepository } from './repositories/invitations.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InvitationsService {
  constructor(private invitationsRepository: InvitationsRepository, private usersService: UsersService) {}

  async createInvitation(createInvitationDto: CreateInvitationDto): Promise<void> {
    // 추천인코드 확인
    const inviter = await this.usersService.getUserByReferralId(createInvitationDto.referralId);

    // 유저 확인
    const invitee = await this.usersService.getUserById(createInvitationDto.userId);

    if (inviter.id === invitee.id) {
      throw new ForbiddenException();
    }

    return this.invitationsRepository.createInvitation(inviter, invitee);
  }
}
