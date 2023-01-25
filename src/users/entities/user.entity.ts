import { UserAgreement } from './user-agreement.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Order } from './../../orders/entities/order.entity';
import { Invitation } from './../../invitations/entities/invitation.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';

@Entity()
@Unique(['id', 'kakaoUid', 'referralId', 'refreshToken'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'bigint' })
  kakaoUid: number;

  @Column({ type: 'varchar', length: 30 })
  nickname: string;

  @Column({ type: 'varchar', length: 13, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  ageRange: string;

  @Column({ type: 'varchar', length: 20 })
  referralId: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'tinyint', default: 0 })
  isAdmin: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToMany(() => Coupon, (coupon) => coupon.user)
  coupons: Coupon[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Invitation, (invitation) => invitation.inviter)
  inviter: Invitation[];

  @OneToMany(() => Invitation, (invitation) => invitation.invitee)
  invitee: Invitation[];

  @OneToMany(() => Team, (team) => team.user)
  teams: Team[];

  @OneToOne(() => UserAgreement, { cascade: true })
  userAgreement: UserAgreement;
}
