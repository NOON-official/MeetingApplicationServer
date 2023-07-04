import { TeamMember } from './team-member.entity';
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

  @Column({ type: 'varchar', length: 255 })
  teamName: string;

  @Column({ type: 'int' })
  gender: number;

  @Column({ type: 'int' })
  memberCount: number;

  @Column({ type: 'json', nullable: true })
  memberCounts: number[];

  @Column({ type: 'json' })
  areas: number[];

  @Column({ type: 'text' })
  intro: string;

  @Column({ type: 'int' })
  drink: number;

  @Column({ type: 'json' })
  prefAge: number[];

  @Column({ type: 'json' })
  prefVibes: number[];

  @Column({ type: 'int', default: 3 })
  teamAvailableDate: number;

  @Column({ type: 'text' })
  kakaoId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  modifiedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToOne(() => Matching, (matching) => matching.appliedTeam, { cascade: true, eager: true })
  appliedTeamMatching: Matching;

  @OneToOne(() => Matching, (matching) => matching.receivedTeam, { cascade: true, eager: true })
  receivedTeamMatching: Matching;

  @OneToOne(() => MatchingRefuseReason, { cascade: true })
  matchingRefuseReason: MatchingRefuseReason;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team, { cascade: true, eager: true })
  teamMembers: TeamMember[];

  @Column({ type: 'int' })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.teams, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'ownerId' })
  user: User;
}
