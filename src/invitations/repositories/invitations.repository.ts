import { User } from 'src/users/entities/user.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Invitation } from '../entities/invitation.entity';
import { Repository } from 'typeorm';
import { AdminGetInvitationSuccessUserDto } from 'src/admin/dtos/admin-get-invitation-success-user.dto';
import { INVITATION_SUCCESS_COUNT } from '../constants/invitation-success-count.constant';

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

  async getUsersWithInvitationCount(): Promise<{ users: AdminGetInvitationSuccessUserDto[] }> {
    const users = await this.createQueryBuilder('invitation')
      .select([
        'user.id AS userId',
        'MAX(invitation.createdAt) AS createdAt',
        'user.nickname AS nickname',
        'user.phone AS phone',
        `FLOOR(COUNT(invitation.inviterId) / ${INVITATION_SUCCESS_COUNT}) AS invitationSuccessCount`,
      ])
      .leftJoin('invitation.inviter', 'user')
      .groupBy('invitation.inviterId')
      .having(`FLOOR(COUNT(invitation.inviterId) / ${INVITATION_SUCCESS_COUNT}) > 0`) // 성공 횟수 1 이상
      .getRawMany();

    users.map((u) => {
      u.invitationSuccessCount = Number(u.invitationSuccessCount);
    });

    return { users };
  }

  async deleteInvitationSuccessByUserIdAndDeleteLimit(userId: number, deleteLimit: number): Promise<void> {
    await this.createQueryBuilder('invitation')
      .select()
      .where('inviterId = :userId', { userId })
      .andWhere('invitation.deletedAt IS NULL')
      .orderBy('invitation.createdAt', 'ASC')
      .limit(deleteLimit)
      .softDelete()
      .execute();
  }
}
