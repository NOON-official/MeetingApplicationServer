import { Team } from 'src/teams/entities/team.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class TeamAvailableDate extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'date' })
  teamAvailableDate: Date;

  @Column({ type: 'int' })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.teamAvailableDates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
