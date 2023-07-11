import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Ting } from '../entities/ting.entity';
import { Repository } from 'typeorm';

@CustomRepository(Ting)
export class TingsRepository extends Repository<Ting> {}
