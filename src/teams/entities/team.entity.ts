import { TeamMember } from './team-member.entity';
import { TeamAvailableDate } from './team-available-date.entity';
import { MatchingRefuseReason } from './../../matchings/entities/matching-refuse-reason.entity';
import { Matching } from './../../matchings/entities/matching.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
@Unique(['id'])
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  gender: number;

  @Column({ type: 'int' })
  memberCount: number;

  @Column({ type: 'json' })
  universities: number[];

  @Column({ type: 'json' })
  areas: number[];

  @Column({ type: 'text' })
  intro: string;

  @Column({ type: 'int' })
  drink: number;

  @Column({ type: 'boolean' })
  prefSameUniversity: boolean;

  @Column({ type: 'json' })
  prefAge: number[];

  @Column({ type: 'json' })
  prefVibes: number[];

  @Column({ type: 'int' })
  startRound: number;

  @Column({ type: 'int' })
  currentRound: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToOne(() => Matching, (matching) => matching.maleTeam, { cascade: true, eager: true })
  maleTeamMatching: Matching;

  @OneToOne(() => Matching, (matching) => matching.femaleTeam, { cascade: true, eager: true })
  femaleTeamMatching: Matching;

  @OneToOne(() => MatchingRefuseReason, { cascade: true })
  matchingRefuseReason: MatchingRefuseReason;

  @OneToMany(() => TeamAvailableDate, (teamAvailableDate) => teamAvailableDate.team, { cascade: true, eager: true })
  teamAvailableDates: TeamAvailableDate[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team, { cascade: true, eager: true })
  teamMembers: TeamMember[];

  @ManyToOne(() => User, (user) => user.teams, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'ownerId' })
  user: User;
}
