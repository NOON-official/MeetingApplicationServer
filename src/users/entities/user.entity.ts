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
import { Ting } from 'src/tings/entities/ting.entity';
import { RecommendedTeam } from 'src/teams/entities/recommended-team.entity';
import { NextRecommendedTeam } from 'src/teams/entities/next-recommended-team.entity';
import { UserStudentCard } from './user-student-card.entity';
import { TingHistory } from 'src/tings/entities/tingHistroy.entity';

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

  @Column({ type: 'int', nullable: true })
  university: number;

  @Column({ type: 'int', nullable: true })
  birth: number;

  @Column({ type: 'varchar', length: 20 })
  referralId: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', nullable: true })
  approval: boolean;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToMany(() => Coupon, (coupon) => coupon.user, { cascade: true })
  coupons: Coupon[];

  @OneToMany(() => Order, (order) => order.user, { cascade: true })
  orders: Order[];

  @OneToMany(() => Ticket, (ticket) => ticket.user, { cascade: true })
  tickets: Ticket[];

  @OneToMany(() => Invitation, (invitation) => invitation.inviter, { cascade: true })
  inviter: Invitation[];

  @OneToMany(() => Invitation, (invitation) => invitation.invitee, { cascade: true })
  invitee: Invitation[];

  @OneToMany(() => Team, (team) => team.user, { cascade: true })
  teams: Team[];

  @OneToOne(() => UserStudentCard, { cascade: true })
  userStudentCard: UserStudentCard;

  @OneToOne(() => UserAgreement, { cascade: true })
  userAgreement: UserAgreement;

  @OneToOne(() => Ting, { cascade: true })
  ting: Ting;

  @OneToOne(() => RecommendedTeam, (recommendedTeam) => recommendedTeam.user, { cascade: true })
  recommendedTeam: RecommendedTeam;

  @OneToOne(() => NextRecommendedTeam, (nextRecommendedTeam) => nextRecommendedTeam.user, { cascade: true })
  nextRecommendedTeam: NextRecommendedTeam;

  @OneToMany(() => TingHistory, (tingHistory) => tingHistory.user, { cascade: true })
  tingHistories: TingHistory[];
}
