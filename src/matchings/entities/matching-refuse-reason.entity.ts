import { Team } from 'src/teams/entities/team.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
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

  @Column({ type: 'tinyint', default: 0 })
  reason1: number;

  @Column({ type: 'tinyint', default: 0 })
  reason2: number;

  @Column({ type: 'tinyint', default: 0 })
  reason3: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  other: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => Matching, { cascade: true })
  @JoinColumn()
  matching: Matching;

  @OneToOne(() => Team, { cascade: true })
  @JoinColumn()
  team: Team;
}
