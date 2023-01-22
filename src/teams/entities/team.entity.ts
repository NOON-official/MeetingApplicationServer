import { TeamPrefVibe } from './team.pref-vibe.enum';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['id'])
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  ownerId: number;

  @Column({ type: 'int' })
  gender: number;

  @Column({ type: 'int' })
  memberCount: number;

  @Column({ type: 'varchar', length: 255 })
  university: string;

  @Column({ type: 'varchar', length: 255 })
  area: string;

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

  @Column({ type: 'enum', enum: TeamPrefVibe })
  prefVibe: string;

  @Column({ type: 'int' })
  startRound: number;

  @Column({ type: 'int', nullable: true })
  currentRound: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
