import { TeamAvailableDate } from '../entities/team-available-date.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(TeamAvailableDate)
export class TeamAvailableDatesRepository extends Repository<TeamAvailableDate> {}
