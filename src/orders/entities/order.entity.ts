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
@Unique(['id', 'tossPaymentKey', 'tossOrderId'])
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  discountAmount: number;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  tossPaymentKey: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  tossOrderId: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  tossOrderName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  tossMethod: string;

  @Column({ type: 'int', nullable: true })
  tossAmount: number;

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
