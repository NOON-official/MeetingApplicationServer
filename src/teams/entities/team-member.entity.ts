import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Team } from './team.entity';

@Entity()
@Unique(['id'])
export class TeamMember extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  role: number;

  @Column({ type: 'int', default:17 })
  mbti: number;

  @Column({ type: 'int' })
  university: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  appearance: string;

  @Column({ type: 'int' })
  age: number;

  @ManyToOne(() => Team, (team) => team.teamMembers, { onDelete: 'CASCADE' })
  team: Team;
}
