import { Team } from './../entities/team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(Team)
export class TeamsRepository extends Repository<Team> {}
