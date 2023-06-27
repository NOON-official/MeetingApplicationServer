import { TicketsService } from './../tickets/tickets.service';
import { CreateCouponDto } from './../coupons/dtos/create-coupon.dto';
import { CouponsService } from 'src/coupons/coupons.service';
import { MatchingFailedEvent } from './../matchings/events/matching-failed.event';
import { MatchingMatchedEvent } from './../matchings/events/matching-matched.event';
import { InvitationsService } from './../invitations/invitations.service';
import { UsersService } from 'src/users/users.service';
import { AdminGetMatchingDto } from './dtos/admin-get-matching.dto';
import { MatchingsService } from './../matchings/matchings.service';
import { TeamsService } from './../teams/teams.service';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AdminGetTeamDto } from './dtos/admin-get-team.dto';
import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { AdminGetUserDto } from './dtos/admin-get-user.dto';
import { AdminGetInvitationSuccessUserDto } from './dtos/admin-get-invitation-success-user.dto';
import * as Universities from '../teams/constants/universities.json';
import { AREA_IGNORE_ID } from 'src/teams/constants/areas';
import { Matching } from 'src/matchings/entities/matching.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchingRound } from 'src/matchings/constants/matching-round';
import { LoggerService } from 'src/common/utils/logger-service.util';
import { AdminGetOurteamRefusedTeamDto } from './dtos/admin-get-ourteam-refused-team.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject(forwardRef(() => TeamsService))
    private teamsService: TeamsService,
    @Inject(forwardRef(() => MatchingsService))
    private matchingsService: MatchingsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
    @Inject(forwardRef(() => CouponsService))
    private couponsService: CouponsService,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async deleteTeamByTeamId(teamId: number): Promise<void> {
    return this.teamsService.deleteTeamById(teamId);
  }

  async deleteMatchingByMatchingId(matchingId: number): Promise<void> {
    return this.matchingsService.deleteMatchingById(matchingId);
  }

  async getTeamsByStatusAndMembercountAndGender(
    status: MatchingStatus,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    return this.teamsService.getTeamsByStatusAndMembercountAndGender(status, membercount, gender);
  }

  async getOurteamRefusedTeams(): Promise<{ teams: AdminGetOurteamRefusedTeamDto[] }> {
    return this.teamsService.getOurteamRefusedTeams();
  }

  async deleteOurteamRefusedTeamByTeamId(teamId: number): Promise<void> {
    return this.teamsService.deleteOurteamRefusedTeamByTeamId(teamId);
  }

  async getMatchingsByStatus(status: MatchingStatus): Promise<{ matchings: AdminGetMatchingDto[] }> {
    return this.matchingsService.getMatchingsByStatus(status);
  }

  async saveChatCreatedAtByMatchingId(matchingId: number): Promise<void> {
    return this.matchingsService.saveChatCreatedAtByMatchingId(matchingId);
  }

  async getAllUsers(): Promise<{ users: AdminGetUserDto[] }> {
    return this.usersService.getAllUsers();
  }

  async getInvitationSuccessUsers(): Promise<{ users: AdminGetInvitationSuccessUserDto[] }> {
    return this.usersService.getInvitationSuccessUsers();
  }

  async deleteInvitationSuccessByUserId(userId: number): Promise<void> {
    return this.invitationsService.deleteInvitationSuccessByUserId(userId);
  }

  // async doMatching(): Promise<void> {
  //   const loggerService = new LoggerService('ADMIN');

  //   const memberCounts: ('2' | '3')[] = ['2', '3'];
  //   const { maxRound } = await this.teamsService.getMaxRound();

  //   const matchedTeamIds = []; // 매칭된 팀ID
  //   const failedTeamIds = []; // 매칭 3회 이상 실패한 팀ID

  //   for (const memberCount of memberCounts) {
  //     // 1. 현재 라운드의 팀 가져오기 (매칭 3회 미만)
  //     // 2. 남/녀 팀으로 구분
  //     const { teams: maleTeamsData } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
  //       MatchingStatus.APPLIED,
  //       memberCount,
  //       TeamGender.male,
  //     );
  //     const maleTeamCount = maleTeamsData.length;
  //     const { teams: femaleTeamsData } = await this.teamsService.getTeamsByStatusAndMembercountAndGender(
  //       MatchingStatus.APPLIED,
  //       memberCount,
  //       TeamGender.female,
  //     );
  //     const femaleTeamCount = femaleTeamsData.length;

  //     // 알고리즘 최적화를 위한 정렬
  //     const univIdToGrade = (id: number) => Universities.find((u) => u.id === id)?.grade;
  //     const maleTeams = maleTeamsData.map((team) => ({
  //       ...team,
  //       maxUnivGrade: Math.max(...team.universities?.map(univIdToGrade)),
  //     }));
  //     maleTeams.sort((a, b) => b.maxUnivGrade - a.maxUnivGrade);

  //     const femaleTeams = femaleTeamsData.map((team) => ({
  //       ...team,
  //       maxUnivGrade: Math.max(...team.universities?.map(univIdToGrade)),
  //     }));
  //     femaleTeams.sort((a, b) => b.maxUnivGrade - a.maxUnivGrade);

  //     const matchings: Matching[] = [];
  //     const failedFemaleTeamIds: number[] = [];
  //     const failedFemaleTeamReasons: string[] = [];

  //     for (const femaleTeam of femaleTeams) {
  //       // 서로 거절한적 있는지 체크
  //       const notRefused = maleTeams.filter(
  //         (maleTeam) =>
  //           !maleTeam.refusedUserIds?.includes(femaleTeam.userId) &&
  //           !femaleTeam.refusedUserIds?.includes(maleTeam.userId),
  //       );
  //       if (notRefused.length === 0) {
  //         failedFemaleTeamIds.push(femaleTeam.teamId);
  //         failedFemaleTeamReasons.push('Refused');
  //         continue;
  //       }

  //       // 3. 대학 레벨 매칭 (동일대학 거부 여부 확인, 가장 높은 대학 기준)
  //       // 여성팀 기준으로 1 낮거나 이상인 대학 필터링
  //       const univMatched = notRefused.filter((maleTeam) => {
  //         if (!femaleTeam.prefSameUniversity) {
  //           const hasSameUniv = maleTeam.universities.some((id) => femaleTeam.universities.includes(id));
  //           if (hasSameUniv) {
  //             return false;
  //           }
  //         }
  //         return maleTeam.maxUnivGrade >= femaleTeam.maxUnivGrade - 1;
  //       });
  //       if (univMatched.length === 0) {
  //         failedFemaleTeamIds.push(femaleTeam.teamId);
  //         failedFemaleTeamReasons.push('University');
  //         continue;
  //       }

  //       // 4. 선호 지역 매칭
  //       // (여자쪽이 상관없음이면 모두 허용)
  //       const areaMatched = femaleTeam.areas.includes(AREA_IGNORE_ID)
  //         ? univMatched
  //         : univMatched.filter((maleTeam) => {
  //             return maleTeam.areas.some((area) => {
  //               // 남자쪽이 상관없음일 경우
  //               if (area === AREA_IGNORE_ID) {
  //                 return true;
  //               }
  //               return femaleTeam.areas.includes(area);
  //             });
  //           });
  //       if (areaMatched.length === 0) {
  //         failedFemaleTeamIds.push(femaleTeam.teamId);
  //         failedFemaleTeamReasons.push('Area');
  //         continue;
  //       }

  //       // 5. 날짜 매칭
  //       const availableDates = await this.teamsService.getAvailableDates(femaleTeam.teamId);
  //       const dateMatchPromises = areaMatched.map(async (maleTeam) => {
  //         const maleAvailDates = await this.teamsService.getAvailableDates(maleTeam.teamId);
  //         return maleAvailDates.some((d) => availableDates.includes(d));
  //       });
  //       const dateMatchResults = await Promise.all(dateMatchPromises);
  //       const dateMatched = areaMatched.filter((_, i) => dateMatchResults[i]);
  //       if (dateMatched.length === 0) {
  //         failedFemaleTeamIds.push(femaleTeam.teamId);
  //         failedFemaleTeamReasons.push('Date');
  //         continue;
  //       }

  //       // 6. 주량 레벨 매칭 (절대값 차이가 4 미만이도록)
  //       const drinkMatched = dateMatched.filter((maleTeam) => {
  //         return Math.abs(femaleTeam.drink - maleTeam.drink) < 4;
  //       });
  //       if (drinkMatched.length === 0) {
  //         failedFemaleTeamIds.push(femaleTeam.teamId);
  //         failedFemaleTeamReasons.push('Drink');
  //         continue;
  //       }

  //       // 7. 나이 매칭 (서로의 선호 나이에 상대방 나이 매칭)
  //       const matched = drinkMatched.filter((maleTeam) => {
  //         if (femaleTeam.prefAge[0] <= maleTeam.averageAge && femaleTeam.prefAge[1] >= maleTeam.averageAge) {
  //           if (maleTeam.prefAge[0] <= femaleTeam.averageAge && maleTeam.prefAge[1] >= femaleTeam.averageAge) {
  //             return true;
  //           }
  //         }
  //         return false;
  //       });
  //       if (matched.length === 0) {
  //         failedFemaleTeamIds.push(femaleTeam.teamId);
  //         failedFemaleTeamReasons.push('Age');
  //         continue;
  //       }

  //       // 매칭된 팀 연결
  //       if (matched.length > 0) {
  //         const maleTeam = matched[0];
  //         const matching = new Matching();
  //         matching.maleTeamId = maleTeam.teamId;
  //         matching.femaleTeamId = femaleTeam.teamId;

  //         // 매칭된 팀ID
  //         matchedTeamIds.push(maleTeam.teamId);
  //         matchedTeamIds.push(femaleTeam.teamId);

  //         matchings.push(matching);

  //         const deleteIndex = maleTeams.indexOf(maleTeam);
  //         maleTeams.splice(deleteIndex, 1);
  //       }
  //     }

  //     await this.matchingsService.saveMatchings(matchings);

  //     // 남은 팀들 라운드 업데이트
  //     const failedMaleTeamIds = maleTeams.map((t) => t.teamId);
  //     await this.teamsService.updateCurrentRound([...failedMaleTeamIds, ...failedFemaleTeamIds], maxRound + 1);
  //     await this.teamsService.updateLastFailReasons(failedFemaleTeamIds, failedFemaleTeamReasons);

  //     // 매칭 3회 이상 실패한 남자팀 ID
  //     for (const teamId of failedMaleTeamIds) {
  //       const team = await this.teamsService.getTeamById(teamId);
  //       if (team.currentRound - team.startRound >= MatchingRound.MAX_TRIAL) {
  //         failedTeamIds.push(teamId);
  //       }
  //     }

  //     // 매칭 3회 이상 실패한 여자팀 ID
  //     for (const teamId of failedFemaleTeamIds) {
  //       const team = await this.teamsService.getTeamById(teamId);
  //       if (team.currentRound - team.startRound >= MatchingRound.MAX_TRIAL) {
  //         failedTeamIds.push(teamId);
  //       }
  //     }

  //     loggerService.verbose(
  //       `[${memberCount}:${memberCount} 매칭] 신청자(남자 ${maleTeamCount}팀/여자 ${femaleTeamCount}팀) 성공(${
  //         matchings.length
  //       }쌍) ${MatchingRound.MAX_TRIAL}회 이상 실패(${failedMaleTeamIds.length + failedFemaleTeamIds.length}팀)`,
  //     );
  //   }

  //   // 매칭되어 수락/거절 대기중인 유저에게 문자 보내기
  //   matchedTeamIds.forEach(async (id) => {
  //     const matchingMatchedEvent = new MatchingMatchedEvent();

  //     matchingMatchedEvent.teamId = id;
  //     this.eventEmitter.emit('matching.matched', matchingMatchedEvent);
  //   });

  //   // 매칭 3회 이상 실패한 유저에게 문자 보내기
  //   failedTeamIds.forEach((id) => {
  //     const matchingFailedEvent = new MatchingFailedEvent();

  //     matchingFailedEvent.teamId = id;
  //     this.eventEmitter.emit('matching.failed', matchingFailedEvent);
  //   });
  // }

  async getAdminTeamCount(): Promise<{
    teamsPerRound: number;
    '2vs2': { male: number; female: number };
    '3vs3': { male: number; female: number };
  }> {
    const teamsPerRound = MatchingRound.MAX_TEAM;

    const { teamCount: male2 } = await this.teamsService.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '2',
      TeamGender.male,
    );

    const { teamCount: female2 } = await this.teamsService.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '2',
      TeamGender.female,
    );

    const { teamCount: male3 } = await this.teamsService.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '3',
      TeamGender.male,
    );

    const { teamCount: female3 } = await this.teamsService.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '3',
      TeamGender.female,
    );

    return {
      teamsPerRound,
      '2vs2': {
        male: male2,
        female: female2,
      },
      '3vs3': {
        male: male3,
        female: female3,
      },
    };
  }

  async createCouponWithUserId(userId: number, createCouponDto: CreateCouponDto): Promise<void> {
    return await this.couponsService.createCouponWithUserId(userId, createCouponDto);
  }

  // async createMatchingByMaleTeamIdAndFemaleTeamId(maleTeamId: number, femaleTeamId: number): Promise<void> {
  //   const loggerService = new LoggerService('ADMIN');

  //   const maleTeam = await this.teamsService.getTeamById(maleTeamId);
  //   const femaleTeam = await this.teamsService.getTeamById(femaleTeamId);

  //   // 해당 팀 정보가 없는 경우
  //   if (!maleTeam || !!maleTeam.deletedAt) {
  //     throw new NotFoundException(`Can't find team with id ${maleTeamId}`);
  //   }

  //   if (!femaleTeam || !!femaleTeam.deletedAt) {
  //     throw new NotFoundException(`Can't find team with id ${femaleTeamId}`);
  //   }

  //   // 팀 성별이 잘못된 경우
  //   if (maleTeam.gender !== 1 || femaleTeam.gender !== 2) {
  //     throw new BadRequestException('invalid team gender');
  //   }

  //   // 이미 거절한 적 있는 경우
  //   if (
  //     maleTeam.user.refusedUserIds?.includes(femaleTeam.ownerId) ||
  //     femaleTeam.user.refusedUserIds?.includes(maleTeam.ownerId)
  //   ) {
  //     throw new BadRequestException('already refused teams');
  //   }

  //   // 이미 매칭중인 경우
  //   if (!!maleTeam.maleTeamMatching || !!femaleTeam.femaleTeamMatching) {
  //     throw new BadRequestException('matching is already exists');
  //   }

  //   // 이미 매칭 실패한 팀인 경우
  //   if (
  //     maleTeam.currentRound - maleTeam.startRound >= MatchingRound.MAX_TRIAL ||
  //     femaleTeam.currentRound - femaleTeam.startRound >= MatchingRound.MAX_TRIAL
  //   ) {
  //     throw new BadRequestException('already failed team');
  //   }

  //   // 팀 인원수가 일치하지 않는 경우
  //   if (maleTeam.memberCount !== femaleTeam.memberCount) {
  //     throw new BadRequestException('invalid team member count');
  //   }

  //   const matching = new Matching();
  //   matching.maleTeamId = maleTeamId;
  //   matching.femaleTeamId = femaleTeamId;

  //   // 매칭 정보 저장
  //   await this.matchingsService.createMatching(matching);

  //   loggerService.verbose(`[${maleTeam.memberCount}:${maleTeam.memberCount} 매칭] 성공(1쌍)`);

  //   const matchedTeamIds = [maleTeamId, femaleTeamId];

  //   // 매칭되어 수락/거절 대기중인 유저에게 문자 보내기
  //   matchedTeamIds.forEach(async (id) => {
  //     const matchingMatchedEvent = new MatchingMatchedEvent();

  //     matchingMatchedEvent.teamId = id;
  //     this.eventEmitter.emit('matching.matched', matchingMatchedEvent);
  //   });
  // }

  async deleteTicketsByUserIdAndTicketCount(userId: number, ticketCount: number): Promise<void> {
    // 존재하는 유저인지 확인
    await this.usersService.getUserById(userId);

    // 유저 미사용 이용권 개수 조회
    const { ticketCount: existingTicketCount } = await this.ticketsService.getTicketCountByUserId(userId);

    if (ticketCount === 0 || ticketCount > existingTicketCount) {
      throw new BadRequestException('invalid ticket count');
    }

    // 이용권 개수만큼 삭제
    return this.ticketsService.deleteTicketsByUserIdAndDeleteLimit(userId, ticketCount);
  }
}
