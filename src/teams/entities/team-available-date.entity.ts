import { Team } from 'src/teams/entities/team.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class TeamAvailableDate extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'date' })
  teamAvailableDate: Date;

  @ManyToOne(() => Team, (team) => team.teamAvailableDates, { onDelete: 'CASCADE' })
  team: Team;
}
