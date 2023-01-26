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
  university: number[];

  @Column({ type: 'json' })
  area: number[];

  @Column({ type: 'text' })
  intro: string;

  @Column({ type: 'int' })
  drink: number;

  @Column({ type: 'tinyint' })
  prefSameUniversity: number;

  @Column({ type: 'int' })
  prefMinAge: number;

  @Column({ type: 'int' })
  prefMaxAge: number;

  @Column({ type: 'json' })
  prefVibe: number[];

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

  @OneToOne(() => Matching, { cascade: true })
  matching: Matching;

  @OneToOne(() => MatchingRefuseReason, { cascade: true })
  matchingRefuseReason: MatchingRefuseReason;

  @OneToMany(() => TeamAvailableDate, (teamAvailableDate) => teamAvailableDate.team, { cascade: true })
  teamAvailableDates: TeamAvailableDate[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team, { cascade: true })
  teamMembers: TeamMember[];

  @ManyToOne(() => User, (user) => user.teams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  user: User;
}
