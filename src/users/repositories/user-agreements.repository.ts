import { UserAgreement } from './../entities/user-agreement.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(UserAgreement)
export class UserAgreementsRepository extends Repository<UserAgreement> {}
