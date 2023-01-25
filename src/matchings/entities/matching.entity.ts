import { Team } from './../../teams/entities/team.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MatchingRefuseReason } from './matching-refuse-reason.entity';

@Entity()
@Unique(['id'])
export class Matching extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'tinyint', nullable: true })
  maleTeamIsAccepted: number;

  @Column({ type: 'tinyint', nullable: true })
  femaleTeamIsAccepted: number;

  @Column({ type: 'timestamp', nullable: true })
  chatCreatedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToOne(() => Team, { cascade: true })
  @JoinColumn()
  maleTeam: Team;

  @OneToOne(() => Team, { cascade: true })
  @JoinColumn()
  femaleTeam: Team;

  @OneToOne(() => MatchingRefuseReason, { cascade: true })
  matchingRefuseReason: MatchingRefuseReason;
}
