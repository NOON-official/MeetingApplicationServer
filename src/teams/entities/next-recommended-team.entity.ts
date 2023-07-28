import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
@Unique(['id'])
export class NextRecommendedTeam extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @OneToOne(() => User, (user) => user.nextRecommendedTeam, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'json', nullable: true })
  nextRecommendedTeamIds: number[] | null;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}