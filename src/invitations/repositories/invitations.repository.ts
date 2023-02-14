import { User } from 'src/users/entities/user.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Invitation } from '../entities/invitation.entity';
import { Repository } from 'typeorm';

@CustomRepository(Invitation)
export class InvitationsRepository extends Repository<Invitation> {
  async createInvitation(inviter: User, invitee: User): Promise<void> {
    const invitation = this.create({ inviter, invitee });

    await this.save(invitation);
  }

  async getInvitationCountByUserId(userId: number): Promise<{ invitationCount: number }> {
    const invitationCount = await this.createQueryBuilder('invitation')
      .where('invitation.inviterId = :userId', { userId })
      .getCount();

    return { invitationCount };
  }

  async getInvitationByInviteeId(inviteeId: number): Promise<Invitation> {
    const invitation = await this.createQueryBuilder('invitation')
      .select()
      .where('invitation.inviteeId = :inviteeId', { inviteeId })
      .withDeleted()
      .getOne();

    return invitation;
  }

  async getInvitationCountWithDeletedByUserId(userId: number): Promise<{ invitationCount: number }> {
    const invitationCount = await this.createQueryBuilder('invitation')
      .where('invitation.inviterId = :userId', { userId })
      .withDeleted()
      .getCount();

    return { invitationCount };
  }
}
