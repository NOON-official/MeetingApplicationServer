import { MatchingStatusConstant } from './constants/matching-status.constant';
import { MatchingRound } from './../matchings/constants/matching-round';
import { SavePhoneDto } from './../auth/dtos/save-phone.dto';
import { OrdersService } from './../orders/orders.service';
import { UserAgreement } from './entities/user-agreement.entity';
import { UserAgreementsRepository } from './repositories/user-agreements.repository';
import { CreateAgreementDto } from './dtos/create-agreement.dto';
import { UserCoupon } from './interfaces/user-coupon.interface';
import { CouponsService } from './../coupons/coupons.service';
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
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import * as moment from 'moment-timezone';
import { AdminGetUserDto, AdminGetUserWithStudentCardDto } from 'src/admin/dtos/admin-get-user.dto';
import { AdminGetInvitationSuccessUserDto } from 'src/admin/dtos/admin-get-invitation-success-user.dto';
import { UpdateUniversityDto, UpdateUserDto } from './dtos/update-user.dto';
import { UserStudentCardRepository } from './repositories/user-student-card.repository';
import { SaveStudentCardDto } from 'src/auth/dtos/save-student-card.dto';
import { GetTeamCardDto } from 'src/teams/dtos/get-team-card.dto';
import { MatchingsService } from 'src/matchings/matchings.service';
import { TingsService } from 'src/tings/tings.service';
import { UserStudentCard } from './entities/user-student-card.entity';
import { FemaleSignUp, MaleSignUp } from './constants/sigin-up.constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StudentCardVerifiedEvent } from './events/student-card-verified.event';
import { StudentCardDeclinedEvent } from './events/student-card-declined.event';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private userAgreementsRepository: UserAgreementsRepository,
    private userStudentCardRepository: UserStudentCardRepository,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
    @Inject(forwardRef(() => TingsService))
    private tingsService: TingsService,
    @Inject(forwardRef(() => CouponsService))
    private couponsService: CouponsService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    @Inject(forwardRef(() => MatchingsService))
    private matchingsService: MatchingsService,
    private eventEmitter: EventEmitter2,
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

  async getMyInfoByUserId(userId: number): Promise<{
    nickname: string;
    phone: string;
    gender: string;
    university: number;
    birth: number;
    isVerified: boolean;
    approval: boolean | null;
  }> {
    return this.usersRepository.getMyInfoByUserId(userId);
  }

  async getTeamsByUserId(userId: number): Promise<{ teams: UserTeam[] }> {
    return this.teamsService.getTeamsByUserId(userId);
  }

  async updateUserPhone(userId: number, phone: SavePhoneDto): Promise<void> {
    return this.usersRepository.updateUserPhone(userId, phone);
  }

  async updateUserInfo(userId: number, updateInfo: UpdateUserDto): Promise<void> {
    return this.usersRepository.updateUserInfo(userId, updateInfo);
  }

  async updateUniversity(userId: number, updateUniversity: UpdateUniversityDto) {
    await this.usersRepository.updateUniversity(userId, updateUniversity);
    const user = await this.usersRepository.getUserById(userId);
    if (user && user.deletedAt === null) {
      const ting = await this.tingsService.getTingCountByUserId(userId);
      if (user.gender === 'male') {
        if (ting.tingCount === -1) {
          const createTingDto = { userId: user.id, tingCount: MaleSignUp };
          await this.tingsService.createTingByUserId(createTingDto);
        } else {
          await this.tingsService.refundTingByUserIdAndTingCount(user.id, MaleSignUp);
        }
      } else if (user.gender === 'female') {
        if (ting.tingCount === -1) {
          const createTingDto = { userId: user.id, tingCount: FemaleSignUp };
          await this.tingsService.createTingByUserId(createTingDto);
        } else {
          await this.tingsService.refundTingByUserIdAndTingCount(user.id, FemaleSignUp);
        }
      }
    }
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

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    return this.teamsService.getTeamIdByUserId(userId);
  }

  async getUserMatchingStatusByUserId(userId: number): Promise<{ matchingStatus: MatchingStatus }> {
    const { teamId } = await this.teamsService.getTeamIdByUserId(userId);

    // CASE 0. 매칭 신청 전
    if (!teamId) {
      return { matchingStatus: null };
    }

    const team = await this.teamsService.getTeamById(teamId);
    const ourteamGender = team.gender === 1 ? 'male' : 'female';
    const matching = team[`${ourteamGender}TeamMatching`];

    // 매칭 정보 X
    // if (matching === null) {
    //   // CASE 1. 매칭 신청 완료 - 매칭 최대 횟수 미만
    //   if (team.currentRound - team.startRound < MatchingRound.MAX_TRIAL) {
    //     return { matchingStatus: MatchingStatus.APPLIED };
    //   }
    //   // CASE 2. 매칭 실패 - 매칭 최대 횟수 이상
    //   else {
    //     return { matchingStatus: MatchingStatus.FAILED };
    //   }
    // }

    // 매칭 정보 O
    const partnerTeamGender = team.gender === 1 ? 'female' : 'male';

    const ourteamIsAccepted = matching[`${ourteamGender}TeamIsAccepted`];
    const partnerTeamIsAccepted = matching[`${partnerTeamGender}TeamIsAccepted`];

    // CASE 3. 매칭 성공 - 상호 수락
    if (ourteamIsAccepted === true && partnerTeamIsAccepted === true) {
      return { matchingStatus: MatchingStatus.SUCCEEDED };
    }

    // CASE 4. 우리팀 거절
    if (ourteamIsAccepted === false) {
      return { matchingStatus: MatchingStatus.OURTEAM_REFUSED };
    }

    const now = new Date();
    const timeLimit = new Date(moment(matching.createdAt).add(1, 'd').format());

    // 매칭된지 24시간 이내
    if (now < timeLimit) {
      // CASE 5. 상대팀 거절
      if (partnerTeamIsAccepted === false) {
        return { matchingStatus: MatchingStatus.PARTNER_TEAM_REFUSED };
      }

      // CASE 6. 우리팀 수락
      if (ourteamIsAccepted === true) {
        return { matchingStatus: MatchingStatus.OURTEAM_ACCEPTED };
      }

      // CASE 7. 매칭 완료 - 우리팀 무응답 & 상대팀 거절 X
      return { matchingStatus: MatchingStatus.MATCHED };
    }
    // 매칭된지 24시간 이후
    else {
      // CASE 8. 우리팀 무응답
      if (ourteamIsAccepted === null) {
        return { matchingStatus: MatchingStatus.NOT_RESPONDED };
      }

      // CASE 5. 상대팀 거절 (OR 무응답)
      if (partnerTeamIsAccepted !== true) return { matchingStatus: MatchingStatus.PARTNER_TEAM_REFUSED };
    }
    return { matchingStatus: MatchingStatus.APPLIED };
  }

  async getUserTingsCount(userId: number): Promise<{ tingCount: number }> {
    return this.tingsService.getTingCountByUserId(userId);
  }

  async getCouponCountByTypeIdAndUserId(typeId: number, userId: number): Promise<{ couponCount: number }> {
    return this.couponsService.getCouponCountByTypeIdAndUserId(typeId, userId);
  }

  async getAllUsers(): Promise<{ users: AdminGetUserDto[] }> {
    const users = await this.usersRepository.getAllUsers();
    const result = [];

    for (const u of users) {
      // 유저 이용권 개수
      const { tingCount } = await this.tingsService.getTingCountByUserId(u.id);

      // 유저 50% 쿠폰 개수
      const { couponCount: discount50CouponCount } = await this.getCouponCountByTypeIdAndUserId(1, u.id);

      // 유저 무료 쿠폰 개수
      const { couponCount: freeCouponCount } = await this.getCouponCountByTypeIdAndUserId(2, u.id);

      // 유저 친구 초대 횟수
      const { invitationCount: userInvitationCount } =
        await this.invitationsService.getInvitationCountWithDeletedByUserId(u.id);

      const user = {
        userId: u.id,
        nickname: u.nickname,
        birth: u.birth,
        university: u.university,
        gender: u.gender,
        phone: u.phone,
        createdAt: u.createdAt,
        referralId: u.referralId,
        approval: u.approval,
        isVerified: u.isVerified,
        tingCount,
        discount50CouponCount,
        freeCouponCount,
        userInvitationCount,
      };

      result.push(user);
    }

    return { users: result };
  }

  async getAllUsersWithStudentCard(): Promise<{ users: AdminGetUserWithStudentCardDto[] }> {
    return this.userStudentCardRepository.getAllUsersWithStudentCard();
  }

  async getInvitationSuccessUsers(): Promise<{ users: AdminGetInvitationSuccessUserDto[] }> {
    return await this.invitationsService.getUsersWithInvitationCount();
  }

  async updateStudentCard(userId: number, studentCard: SaveStudentCardDto): Promise<UserStudentCard> {
    const user = await this.usersRepository.getUserById(userId);
    if (!user.nickname) {
      throw new BadRequestException(`user with user id ${userId} is not exists`);
    }

    if (user.isVerified === false) {
      await this.usersRepository.applyByUserStudentCard(userId);
    }
    if (user.isVerified && user.approval === false) {
      await this.usersRepository.resetApprovalUserStudentCard(userId);
    }

    return this.userStudentCardRepository.updateUserStudentCard(userId, studentCard);
  }

  async verifyUserByStudentCard(userId: number): Promise<void> {
    const user = await this.usersRepository.getUserById(userId);
    if (!user.id) {
      throw new BadRequestException(`user with user id ${userId} is not exists`);
    }

    await this.usersRepository.verifyUserByStudentCard(userId);

    // 학생증 인증 승인 결과 문자 발송
    const studentCardVerifiedEvent = new StudentCardVerifiedEvent();
    studentCardVerifiedEvent.user = user;
    this.eventEmitter.emit('student-card.verified', studentCardVerifiedEvent);
  }

  async declineUserByStudentCard(userId: number): Promise<void> {
    const user = await this.usersRepository.getUserById(userId);
    if (!user.id) {
      throw new BadRequestException(`user with user id ${userId} is not exists`);
    }

    await this.usersRepository.declineUserByStudentCard(userId);

    // 학생증 인증 거절 결과 문자 발송
    const studentCardDeclinedEvent = new StudentCardDeclinedEvent();
    studentCardDeclinedEvent.user = user;
    this.eventEmitter.emit('student-card.declined', studentCardDeclinedEvent);
  }

  async resetApprovalUserStudentCard(userId: number): Promise<void> {
    const user = await this.usersRepository.getUserById(userId);
    if (!user.id) {
      throw new BadRequestException(`user with user id ${userId} is not exists`);
    }

    return this.usersRepository.resetApprovalUserStudentCard(userId);
  }

  async getRecommendedTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const { teamId } = await this.getTeamIdByUserId(userId);

    // 해당 유저의 팀이 없는 경우 추천팀 조회 불가
    if (!teamId) {
      throw new BadRequestException(`team with user id ${userId} is not exists`);
    }

    const nextRecommendedTeam = await this.teamsService.getNextRecommendedTeamByUserId(userId);

    // 다음 추천팀이 준비됐고, 새로운 추천 시간(오후 11시) 이후인 경우
    if (nextRecommendedTeam?.nextRecommendedTeamIds?.length > 0) {
      // 다음 업데이트 시간 === 다음 추천팀 업데이트 날짜의 오후 11시 (UTC 14:00)
      const nextUpdatedTime = moment(nextRecommendedTeam.updatedAt).format('YYYY-MM-DD 14:00');
      const now = moment(new Date()).format('YYYY-MM-DD HH:mm');

      // 추천팀 갱신
      if (now >= nextUpdatedTime) {
        // 다음 추천팀 데이터를 기존 추천팀 테이블로 이동
        await this.teamsService.updateRecommendedTeamIdsByUserId(userId);

        // 다음 추천팀 테이블 데이터 삭제
        await this.teamsService.deleteNextRecommendedTeamIdsByUserId(userId);
      }
    }
    // 추천팀 반환
    return this.teamsService.getRecommendedTeamCardsByUserId(userId);
  }

  async getAppliedTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const { teamId } = await this.getTeamIdByUserId(userId);

    if (!teamId) return { teams: [] };
    else return this.matchingsService.getAppliedTeamCardsByTeamId(teamId);
  }

  async getRefusedTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const { teamId } = await this.getTeamIdByUserId(userId);

    if (!teamId) return { teams: [] };
    else return this.matchingsService.getRefusedTeamCardsByTeamId(teamId);
  }

  async getReceivedTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const { teamId } = await this.getTeamIdByUserId(userId);

    if (!teamId) return { teams: [] };
    else return this.matchingsService.getReceivedTeamCardsByTeamId(teamId);
  }

  async getSucceededTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    return this.matchingsService.getSucceededTeamCardsByUserId(userId);
  }

  async deleteMatchingByUserId(userId: number, matchingIds: number[]): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      for (const matchingId of matchingIds['matchingIds']) {
        await this.matchingsService.deleteMatchingAndTeamByMatchingId(matchingId);
      }
    }
  }
}
