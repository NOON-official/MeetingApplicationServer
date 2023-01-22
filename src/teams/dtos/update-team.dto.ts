import { CreateTeamDto } from './create-team.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
