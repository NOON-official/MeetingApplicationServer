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

  @Column({ type: 'boolean', nullable: true })
  maleTeamIsAccepted: boolean;

  @Column({ type: 'boolean', nullable: true })
  femaleTeamIsAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  chatCreatedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToOne(() => Team, (team) => team.maleTeamMatching, { onDelete: 'CASCADE' })
  @JoinColumn()
  maleTeam: Team;

  @OneToOne(() => Team, (team) => team.femaleTeamMatching, { onDelete: 'CASCADE' })
  @JoinColumn()
  femaleTeam: Team;

  @OneToOne(() => MatchingRefuseReason, { cascade: true })
  matchingRefuseReason: MatchingRefuseReason;
}
