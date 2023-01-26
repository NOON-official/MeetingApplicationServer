import { Ticket } from './../../tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['id', 'paymentId'])
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  paymentId: string;

  @Column({ type: 'int' })
  type: number;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @OneToOne(() => Coupon, { cascade: true })
  @JoinColumn()
  coupon: Coupon;

  @OneToMany(() => Ticket, (ticket) => ticket.order, { cascade: true })
  tickets: Ticket[];
}
