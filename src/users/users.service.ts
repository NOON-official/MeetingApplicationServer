import { OrdersService } from './../orders/orders.service';
import { UserAgreement } from './entities/user-agreement.entity';
import { UserAgreementsRepository } from './repositories/user-agreements.repository';
import { CreateAgreementDto } from './dtos/create-agreement.dto';
import { UserCoupon } from './interfaces/user-coupon.interface';
import { CouponsService } from './../coupons/coupons.service';
import { UpdatePhoneDto } from './dtos/update-phone.dto';
import { TeamsService } from './../teams/teams.service';
import { InvitationsService } from './../invitations/invitations.service';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserTeam } from './interfaces/user-team.interface';
import { KakaoUser } from 'src/auth/interfaces/kakao-user.interface';
import { TicketsService } from 'src/tickets/tickets.service';
import { BadRequestException } from '@nestjs/common/exceptions';
import { UserOrder } from './interfaces/user-order.interface';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private userAgreementsRepository: UserAgreementsRepository,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
    @Inject(forwardRef(() => CouponsService))
    private couponsService: CouponsService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {}

  async getUserByKakaoUid(kakaoUid: number): Promise<User> {
    return this.usersRepository.getUserByKakaoUid(kakaoUid);
  }

  async createUser(kakaoUser: KakaoUser): Promise<User> {
    const referralId = new Date().getTime().toString(36).toUpperCase(); // 추천인 코드 생성

    const userData = { ...kakaoUser, referralId };

    return this.usersRepository.createUser(userData);
  }

  async updateUserAgeRange(userId: number, ageRange: string) {
    return this.usersRepository.updateAgeRange(userId, ageRange);
  }

  async updateUserGender(userId: number, gender: string) {
    return this.usersRepository.updateGender(userId, gender);
  }

  async updateUserRefreshToken(userId: number, refreshToken: string) {
    return this.usersRepository.updateRefreshToken(userId, refreshToken);
  }

  async deleteUserRefreshToken(userId: number) {
    return this.usersRepository.deleteRefreshToken(userId);
  }

  async getUserById(userId: number): Promise<User> {
    return this.usersRepository.getUserById(userId);
  }

  async deleteAccount(userId: number): Promise<void> {
    return this.usersRepository.deleteAccountByUserId(userId);
  }

  async getUserByReferralId(referralId: string): Promise<User> {
    return this.usersRepository.getUserByReferralId(referralId);
  }

  async getInvitationCountByUserId(userId: number): Promise<{ invitationCount: number }> {
    let { invitationCount } = await this.invitationsService.getInvitationCountByUserId(userId);

    // 초대횟수가 4회 이상인 경우 4 반환
    if (invitationCount > 4) {
      invitationCount = 4;
    }

    return { invitationCount };
  }

  async getReferralIdByUserId(userId: number): Promise<{ referralId: string }> {
    return this.usersRepository.getReferralIdByUserId(userId);
  }

  async getMyInfoByUserId(userId: number): Promise<{ nickname: string; phone: string }> {
    return this.usersRepository.getMyInfoByUserId(userId);
  }

  async getTeamsByUserId(userId: number): Promise<{ teams: UserTeam[] }> {
    return this.teamsService.getTeamsByUserId(userId);
  }

  async updateUserPhone(userId: number, phone: UpdatePhoneDto): Promise<void> {
    return this.usersRepository.updateUserPhone(userId, phone);
  }

  async getTicketCountByUserId(userId: number): Promise<{ ticketCount: number }> {
    return this.ticketsService.getTicketCountByUserId(userId);
  }

  async getCouponCountByUserId(userId: number): Promise<{ couponCount: number }> {
    return this.couponsService.getCouponCountByUserId(userId);
  }

  async getCouponsByUserId(userId: number): Promise<{ coupons: UserCoupon[] }> {
    return this.couponsService.getCouponsByUserId(userId);
  }

  async createAgreement(userId: number, createAgreementDto: CreateAgreementDto): Promise<void> {
    const user = await this.usersRepository.getUserById(userId);
    const userAgreement = await this.userAgreementsRepository.getAgreementByUserId(userId);

    if (!!userAgreement) {
      throw new BadRequestException(`user agreement with user id ${userId} is already exists`);
    }

    return this.userAgreementsRepository.createAgreement(user, createAgreementDto);
  }

  async getAgreementByUserId(userId: number): Promise<UserAgreement> {
    const userAgreement = await this.userAgreementsRepository.getAgreementByUserId(userId);

    if (!userAgreement) {
      throw new NotFoundException(`Can't find user agreement with user id ${userId}`);
    }

    return userAgreement;
  }

  async getOrdersByUserId(userId: number): Promise<{ orders: UserOrder[] }> {
    return this.ordersService.getOrdersByUserId(userId);
  }
}
