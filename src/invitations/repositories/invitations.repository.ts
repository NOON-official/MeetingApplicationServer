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
}
