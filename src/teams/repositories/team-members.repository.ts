import { TeamMember } from './../entities/team-member.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(TeamMember)
export class TeamMembersRepository extends Repository<TeamMember> {}
