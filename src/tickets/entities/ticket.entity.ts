import { User } from 'src/users/entities/user.entity';
import { Order } from './../../orders/entities/order.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Matching } from 'src/matchings/entities/matching.entity';

@Entity()
@Unique(['id'])
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.tickets, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Order, (order) => order.tickets, { onDelete: 'CASCADE' })
  order: Order;

  @OneToOne(() => Matching, (matching) => matching.maleTeamTicket, { cascade: true })
  maleTeamMatching: Matching;

  @OneToOne(() => Matching, (matching) => matching.femaleTeamTicket, { cascade: true })
  femaleTeamMatching: Matching;
}
