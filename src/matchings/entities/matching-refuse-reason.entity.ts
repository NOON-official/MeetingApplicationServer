import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class MatchingRefuseReason extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  matchingId: number;

  @Column({ type: 'int' })
  teamId: number;

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
}
