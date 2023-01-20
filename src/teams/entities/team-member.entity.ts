import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class TeamMember extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  teamId: number;

  @Column({ type: 'int' })
  role: number;

  @Column({ type: 'int' })
  mbti: number;

  @Column({ type: 'varchar', length: 50 })
  appearance: string;

  @Column({ type: 'int' })
  age: number;
}
