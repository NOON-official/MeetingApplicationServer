import { TeamGender } from '../entities/team-gender.enum';

export interface TeamForMatching {
  id: number;
  ownerId: number;
  gender: TeamGender;
  age: number;
  memberCount: number;
  memberCounts?: number[];
  availableDate?: number[];
  areas: number[];
  prefAge: number[];
  excludedTeamIds: number[];
  createdAt: Date;
}
