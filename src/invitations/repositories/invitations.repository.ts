import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Invitation } from '../entities/invitation.entity';
import { Repository } from 'typeorm';

@CustomRepository(Invitation)
export class InvitationsRepository extends Repository<Invitation> {}
