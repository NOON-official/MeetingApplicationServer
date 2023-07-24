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
import { Ticket } from 'src/tickets/entities/ticket.entity';

@Entity()
@Unique(['id'])
export class Matching extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'boolean', nullable: true })
  appliedTeamIsAccepted: boolean;

  @Column({ type: 'boolean', nullable: true })
  receivedTeamIsAccepted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  matchedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'int' })
  appliedTeamId: number;

  @OneToOne(() => Team, (team) => team.appliedTeamMatching, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appliedTeamId' })
  appliedTeam: Team;

  @Column({ type: 'int' })
  receivedTeamId: number;

  @OneToOne(() => Team, (team) => team.receivedTeamMatching, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receivedTeamId' })
  receivedTeam: Team;

  @Column({ type: 'boolean', nullable: true, default: null })
  appliedTeamIsPaid: boolean;

  @Column({ type: 'boolean', nullable: true, default: null })
  receivedTeamIsPaid: boolean;

  @OneToOne(() => MatchingRefuseReason, { cascade: true })
  matchingRefuseReason: MatchingRefuseReason;
}
