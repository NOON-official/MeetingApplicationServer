import { MatchingRefuseReason } from '../entities/matching-refuse-reason.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(MatchingRefuseReason)
export class MatchingRefuseReasonsRepository extends Repository<MatchingRefuseReason> {}
