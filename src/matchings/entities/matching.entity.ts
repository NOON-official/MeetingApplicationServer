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
export class Matching extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  maleTeamId: number;

  @Column({ type: 'int' })
  femaleTeamId: number;

  @Column({ type: 'tinyint', nullable: true })
  maleTeamIsAccepted: number;

  @Column({ type: 'tinyint', nullable: true })
  femaleTeamIsAccepted: number;

  @Column({ type: 'timestamp' })
  chatCreatedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
