import { Team } from 'src/teams/entities/team.entity';
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
} from 'typeorm';
import { Matching } from './matching.entity';

@Entity()
@Unique(['id'])
export class MatchingRefuseReason extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'boolean', default: false })
  reason1: boolean;

  @Column({ type: 'boolean', default: false })
  reason2: boolean;

  @Column({ type: 'boolean', default: false })
  reason3: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  other: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToOne(() => Matching, { onDelete: 'CASCADE' })
  @JoinColumn()
  matching: Matching;

  @OneToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn()
  team: Team;
}
