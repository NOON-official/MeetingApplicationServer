import { AdminGetPartnerTeamNotRespondedTeamDto } from './../admin/dtos/admin-get-partner-team-not-responded-team.dto';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { MatchingsService } from './../matchings/matchings.service';
import { GetTeamDetailDto, GetTeamDto, getMemberDto } from './dtos/get-team.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { MatchingRound } from './../matchings/constants/matching-round';
import { CreateMemberDto, CreateTeamDto } from './dtos/create-team.dto';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TeamsRepository } from './repositories/teams.repository';
import { UsersService } from 'src/users/users.service';
import { UserTeam } from 'src/users/interfaces/user-team.interface';
import { TeamGender } from './entities/team-gender.enum';
import { teamPagedata } from './interfaces/team-pagedata.interface';
import { Genders } from './constants/genders';
import * as Universities from './constants/universities.json';
import { Areas } from './constants/areas';
import { Mbties } from './constants/mbties';
import { Roles } from './constants/roles';
import { SameUniversities } from './constants/same-universities';
import { Vibes } from './constants/vibes';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { Team } from './entities/team.entity';
import { AdminGetTeamDto } from 'src/admin/dtos/admin-get-team.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminGetOurteamRefusedTeamDto } from 'src/admin/dtos/admin-get-ourteam-refused-team.dto';
import { TeamMember } from './entities/team-member.entity';
import { NextRecommendedTeam } from './entities/next-recommended-team.entity';
import { NextRecommendedTeamsRepository } from './repositories/next-recommended-team.repository';
import { RecommendedTeamsRepository } from './repositories/recommended-team.repository';
import { RecommendedTeam } from './entities/recommended-team.entity';
import { GetTeamCardDto } from './dtos/get-team-card.dto';
import { TeamForMatching } from './interfaces/team-for-matching.interface';
import { concat, difference, intersection, take, uniq } from 'lodash';
import { TEAM_LIMIT } from 'src/teams/constants/recommended_team.constant';

@Injectable()
export class TeamsService {
  constructor(
    private teamsRepository: TeamsRepository,
    private recommendedTeamsRepository: RecommendedTeamsRepository,
    private nextRecommendedTeamsRepository: NextRecommendedTeamsRepository,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => MatchingsService))
    private matchingsService: MatchingsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto, userId: number): Promise<void> {
    const {
      memberCount,
      memberCounts,
      areas,
      teamAvailableDate,
      teamName,
      intro,
      drink,
      prefAge,
      prefVibes,
      members,
      kakaoId,
    } = createTeamDto;

    const user = await this.usersService.getUserById(userId);
    const team = await this.teamsRepository.getTeamIdByUserId(userId);

    if (team.teamId !== null) {
      const existingTeam = await this.getTeamById(team.teamId);

      // 업데이트 팀 정보
      const teamData = {
        gender: existingTeam.gender,
        memberCount: memberCount ?? existingTeam.memberCount,
        memberCounts: memberCounts ?? existingTeam.memberCounts,
        teamAvailableDate: teamAvailableDate ?? existingTeam.teamAvailableDate,
        areas: areas ?? existingTeam.areas,
        teamName: teamName ?? existingTeam.teamName,
        intro: intro ?? existingTeam.intro,
        drink: drink ?? existingTeam.drink,
        prefAge: prefAge ?? existingTeam.prefAge,
        prefVibes: prefVibes ?? existingTeam.prefVibes,
        kakaoId: kakaoId ?? existingTeam.kakaoId,
      };

      await this.teamsRepository.updateTeam(existingTeam.id, teamData);

      if (members || members?.length !== 0) {
        const alreadyTeam = await this.getApplicationTeamById(existingTeam.id);
        const newMembers = alreadyTeam.members;
        newMembers.map(async (newMember: TeamMember, index: number) => {
          await this.teamsRepository.updateTeamMember(newMember.id, members[index]);
        });
      }
    } else {
      const gender = user.gender === 'male' ? 1 : 2;

      // 팀 정보 저장
      const { teamId } = await this.teamsRepository.createTeam(
        {
          gender,
          memberCount,
          teamAvailableDate,
          areas,
          teamName,
          intro,
          drink,
          prefAge,
          prefVibes,
          memberCounts,
          kakaoId,
        },
        user,
      );

      const team = await this.getTeamById(teamId);

      // 팀 멤버 저장
      await this.teamsRepository.createTeamMember(members, team);

      const matchingTeam: TeamForMatching = {
        id: team.id,
        ownerId: team.ownerId,
        gender: gender === 1 ? TeamGender.male : TeamGender.female,
        age: Math.round(members.reduce((total, member) => total + member.age, 0) / members.length),
        memberCount,
        memberCounts,
        availableDate: teamAvailableDate,
        areas,
        prefAge,
        excludedTeamIds: team.excludedTeamIds,
        createdAt: team.createdAt,
      };

      const { teams: matchedTeams } = await this.getTeamsByGenderForMatching(
        gender === 1 ? TeamGender.female : TeamGender.male,
      );
      await this.matchTeam(matchingTeam, matchedTeams, false);
    }
  }

  // 성별 별로 팀 조회
  async getTeamsByGender(gender: TeamGender): Promise<{ teams: AdminGetTeamDto[] }> {
    return this.teamsRepository.getTeamsByGender(gender);
  }

  // 신청 내역 조회
  async getTeamsByUserId(userId: number): Promise<{ teams: UserTeam[] }> {
    const { teamsWithMatching } = await this.teamsRepository.getTeamsByUserId(userId);
    // const teams = teamsWithMatching.map((t) => ({
    //   id: t.id,
    //   memberCount: t.memberCount,
    //   createdAt: t.createdAt,
    //   chatCreatedAt: (t.maleTeamMatching || t.femaleTeamMatching)?.chatCreatedAt ?? null,
    // }));
    const teams = [];

    return { teams };
  }

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    return this.teamsRepository.getTeamIdByUserId(userId);
  }

  // async getMembersCountOneWeek(): Promise<{ memberCount: number }> {
  //   return this.teamsRepository.getMembersCountOneWeek();
  // }

  async getMembersCountTotal(): Promise<{ memberCount: number }> {
    return this.teamsRepository.getMembersCountTotal();
  }

  async getTeamCountByMembercountAndGender(
    membercount: '2' | '3' | '4',
    gender: TeamGender,
  ): Promise<{ teamCount: number }> {
    return this.teamsRepository.getTeamCountByMembercountAndGender(membercount, gender);
  }

  // async getTeamCount(): Promise<{
  //   teamsPerRound: number;
  //   '2vs2': { male: number; female: number };
  //   '3vs3': { male: number; female: number };
  //   '4vs4': { male: number; female: number };
  // }> {
  //   const teamsPerRound = MatchingRound.MAX_TEAM;

  //   let { teamCount: male2 } = await this.getTeamCountByStatusAndMembercountAndGender(
  //     MatchingStatus.APPLIED,
  //     '2',
  //     TeamGender.male,
  //   );

  //   // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
  //   if (male2 < MatchingRound.MIN_TEAM) male2 = MatchingRound.MIN_TEAM;
  //   if (male2 > MatchingRound.MAX_TEAM) male2 = MatchingRound.MAX_TEAM;

  //   let { teamCount: female2 } = await this.getTeamCountByStatusAndMembercountAndGender(
  //     MatchingStatus.APPLIED,
  //     '2',
  //     TeamGender.female,
  //   );

  //   // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
  //   if (female2 < MatchingRound.MIN_TEAM) female2 = MatchingRound.MIN_TEAM;
  //   if (female2 > MatchingRound.MAX_TEAM) female2 = MatchingRound.MAX_TEAM;

  //   let { teamCount: male3 } = await this.getTeamCountByStatusAndMembercountAndGender(
  //     MatchingStatus.APPLIED,
  //     '3',
  //     TeamGender.male,
  //   );

  //   // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
  //   if (male3 < MatchingRound.MIN_TEAM) male3 = MatchingRound.MIN_TEAM;
  //   if (male3 > MatchingRound.MAX_TEAM) male3 = MatchingRound.MAX_TEAM;

  //   let { teamCount: female3 } = await this.getTeamCountByStatusAndMembercountAndGender(
  //     MatchingStatus.APPLIED,
  //     '3',
  //     TeamGender.female,
  //   );

  //   // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
  //   if (female3 < MatchingRound.MIN_TEAM) female3 = MatchingRound.MIN_TEAM;
  //   if (female3 > MatchingRound.MAX_TEAM) female3 = MatchingRound.MAX_TEAM;

  //   let { teamCount: male4 } = await this.getTeamCountByStatusAndMembercountAndGender(
  //     MatchingStatus.APPLIED,
  //     '4',
  //     TeamGender.male,
  //   );

  //   // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
  //   if (male4 < MatchingRound.MIN_TEAM) male4 = MatchingRound.MIN_TEAM;
  //   if (male4 > MatchingRound.MAX_TEAM) male4 = MatchingRound.MAX_TEAM;

  //   let { teamCount: female4 } = await this.getTeamCountByStatusAndMembercountAndGender(
  //     MatchingStatus.APPLIED,
  //     '4',
  //     TeamGender.female,
  //   );

  //   // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
  //   if (female4 < MatchingRound.MIN_TEAM) female4 = MatchingRound.MIN_TEAM;
  //   if (female4 > MatchingRound.MAX_TEAM) female4 = MatchingRound.MAX_TEAM;

  //   return {
  //     teamsPerRound,
  //     '2vs2': {
  //       male: male2,
  //       female: female2,
  //     },
  //     '3vs3': {
  //       male: male3,
  //       female: female3,
  //     },
  //     '4vs4': {
  //       male: male3,
  //       female: female3,
  //     },
  //   };
  // }

  // async getTeamPagedata(): Promise<{
  //   Genders: teamPagedata[];
  //   Universities: teamPagedata[];
  //   Areas: teamPagedata[];
  //   Mbties: teamPagedata[];
  //   Roles: teamPagedata[];
  //   SameUniversities: teamPagedata[];
  //   Vibes: teamPagedata[];
  // }> {
  //   return { Genders, Universities, Areas, Mbties, Roles, SameUniversities, Vibes };
  // }

  async updateTeam(teamId: number, updateTeamDto: UpdateTeamDto): Promise<void> {
    const team = await this.getTeamById(teamId);

    // 해당 팀 정보가 없는 경우
    if (!team || !!team.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${teamId}`);
    }

    const {
      memberCount,
      memberCounts,
      areas,
      teamAvailableDate,
      teamName,
      intro,
      drink,
      prefAge,
      prefVibes,
      members,
      kakaoId,
    } = updateTeamDto;

    // 업데이트 팀 정보
    const teamData = {
      gender: team.gender,
      memberCount: memberCount ?? team.memberCount,
      memberCounts: memberCounts ?? team.memberCounts,
      teamAvailableDate: teamAvailableDate ?? team.teamAvailableDate,
      areas: areas ?? team.areas,
      teamName: teamName ?? team.teamName,
      intro: intro ?? team.intro,
      drink: drink ?? team.drink,
      prefAge: prefAge ?? team.prefAge,
      prefVibes: prefVibes ?? team.prefVibes,
      kakaoId: kakaoId ?? team.kakaoId,
    };

    await this.teamsRepository.updateTeam(teamId, teamData);

    if (members || members?.length !== 0) {
      const existingTeam = await this.getApplicationTeamById(teamId);
      const newMembers = existingTeam.members;
      newMembers.map((m: TeamMember) => {
        delete m.id;
      });

      await this.teamsRepository.createTeamMember(members, team);
    }
  }

  async deleteTeamById(teamId: number): Promise<void> {
    const team = await this.getTeamById(teamId);

    // 해당 팀 정보가 없는 경우
    if (!team || !!team.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${teamId}`);
    }

    await this.teamsRepository.deleteTeamById(teamId);
  }

  async getTeamById(teamId: number): Promise<Team> {
    return this.teamsRepository.getTeamById(teamId);
  }

  async getApplicationTeamById(teamId: number): Promise<GetTeamDto> {
    const team = await this.getTeamById(teamId);

    team['ownerId'] = team.user.id;
    const approval = team.user.approval;

    delete Object.assign(team, { ['members']: team['teamMembers'] })['teamMembers']; // 프로퍼티 이름 변경
    delete team.user;
    delete team.appliedTeamMatching;
    delete team.receivedTeamMatching;
    delete team.kakaoId;

    const result = Object.assign(team);
    result['approval'] = approval;

    return result;
  }

  async getApplicationTeamDetailById(teamId: number): Promise<GetTeamDetailDto> {
    const team = await this.getTeamById(teamId);

    team['ownerId'] = team.user.id;
    const approval = team.user.approval;

    delete Object.assign(team, { ['members']: team['teamMembers'] })['teamMembers']; // 프로퍼티 이름 변경
    delete team.user;
    delete team.appliedTeamMatching;
    delete team.receivedTeamMatching;

    const result = Object.assign(team);
    result['approval'] = approval;

    return result;
  }

  // async reapplyTeam(teamId: number): Promise<void> {
  //   // 1. 기존 팀 정보 가져오기
  //   const existingTeam = await this.getApplicationTeamById(teamId);
  //   if (!!existingTeam.deletedAt) {
  //     throw new NotFoundException(`Can't find team with id ${teamId}`);
  //   }

  //   const user = await this.usersService.getUserById(existingTeam.ownerId);

  //   const newTeamData = {
  //     gender: existingTeam.gender,
  //     memberCount: existingTeam.memberCount,
  //     memberCounts: existingTeam.memberCounts,
  //     teamAvailableDate: existingTeam.teamAvailableDate,
  //     areas: existingTeam.areas,
  //     teamName: existingTeam.teamName,
  //     intro: existingTeam.intro,
  //     drink: existingTeam.drink,
  //     prefAge: existingTeam.prefAge,
  //     prefVibes: existingTeam.prefVibes,
  //     kakaoId: existingTeam.kakaoId,
  //   };

  //   // 2. 새로운 팀 생성하기
  //   const { teamId: newTeamId } = await this.teamsRepository.createTeam(newTeamData, user);
  //   const newTeam = await this.getTeamById(newTeamId);

  //   // 팀 멤버 저장
  //   const newMembers = existingTeam.members.map((m) => {
  //     return { role: m.role, mbti: m.mbti, appearance: m.appearance, age: m.age, university: m.university };
  //   });
  //   await this.teamsRepository.createTeamMember(newMembers, newTeam);

  //   // 3. 기존 팀 삭제하기(soft delete)
  //   await this.deleteTeamById(teamId);

  //   // 신청팀 수가 다 찼을 경우 매칭 알고리즘 실행 - 자동화 적용 시 주석 해제하기
  //   // this.eventEmitter.emit('team.created');
  // }

  // async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
  //   return this.matchingsService.getMatchingIdByTeamId(teamId);
  // }

  // async getTeamsByStatusAndMembercountAndGender(
  //   status: MatchingStatus,
  //   membercount: '2' | '3' | '4',
  //   gender: TeamGender,
  // ): Promise<{ teams: AdminGetTeamDto[] }> {
  //   // 신청자 조회
  //   if (status === MatchingStatus.APPLIED) {
  //     return this.teamsRepository.getAppliedTeamsByGender(gender);
  //   }

  //   // 수락/거절 대기자 조회
  //   if (status === MatchingStatus.MATCHED) {
  //     return this.teamsRepository.getMatchedTeamsByGender(gender);
  //   }

  //   // 매칭 실패 회원 조회
  //   if (status === MatchingStatus.FAILED) {
  //     return this.teamsRepository.getFailedTeamsByMembercountAndGender(gender);
  //   }

  //   // 거절 당한 회원 조회
  //   if (status === MatchingStatus.PARTNER_TEAM_REFUSED) {
  //     return this.teamsRepository.getPartnerTeamRefusedTeamsByGender(gender);
  //   }
  // }

  async getOurteamRefusedTeams(): Promise<{ teams: AdminGetOurteamRefusedTeamDto[] }> {
    return this.matchingsService.getMatchingRefuseReasons();
  }

  async deleteOurteamRefusedTeamByTeamId(teamId: number): Promise<void> {
    return this.matchingsService.deleteMatchingRefuseReasonByTeamId(teamId);
  }

  // 상대팀 무응답이고 아직 환불받지 않은 팀 조회
  // async getPartnerTeamNotRespondedTeamsByGender(
  //   gender: TeamGender,
  // ): Promise<{ teams: AdminGetPartnerTeamNotRespondedTeamDto[] }> {
  //   return this.teamsRepository.getPartnerTeamNotRespondedTeamsByGender(gender);
  // }

  async deleteTeamsByUserId(userId: number): Promise<void> {
    return this.teamsRepository.deleteTeamsByUserId(userId);
  }

  async updateExcludedTeamsByUserIdAndExcludedTeamId(userId: number, excludedTeamId: number): Promise<void> {
    const { teamId } = await this.getTeamIdByUserId(userId);

    if (!teamId) {
      throw new NotFoundException(`Can't find team with user id ${userId}`);
    }

    await this.teamsRepository.updateExcludedTeamIds(teamId, excludedTeamId);

    // 해당 팀이 추천팀에 포함되는 경우 추천팀에서 삭제
    let { recommendedTeamIds } = (await this.getRecommendedTeamByUserId(userId)) || {};

    const excludedRecommendedTeamIndex = recommendedTeamIds?.indexOf(excludedTeamId);
    if (excludedRecommendedTeamIndex !== undefined && excludedRecommendedTeamIndex !== -1) {
      recommendedTeamIds?.splice(excludedRecommendedTeamIndex, 1);

      await this.updateRecommendedTeamIdsByUserIdAndRecommendedTeamIds(userId, recommendedTeamIds);
    }

    // 해당 팀이 다음 추천팀에 포함되는 경우 추천팀에서 삭제
    let { nextRecommendedTeamIds } = (await this.getNextRecommendedTeamByUserId(userId)) || {};

    const excludedNextRecommendedTeamIndex = nextRecommendedTeamIds?.indexOf(excludedTeamId);
    if (excludedNextRecommendedTeamIndex !== undefined && excludedNextRecommendedTeamIndex !== -1) {
      nextRecommendedTeamIds?.splice(excludedNextRecommendedTeamIndex, 1);

      await this.updateNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(userId, nextRecommendedTeamIds);
    }
  }

  async getRecommendedTeamByUserId(userId: number): Promise<RecommendedTeam> {
    const recommendedTeam = await this.recommendedTeamsRepository.getRecommendedTeamByUserId(userId);

    return recommendedTeam;
  }

  async getNextRecommendedTeamByUserId(userId: number): Promise<NextRecommendedTeam> {
    const nextRecommendedTeam = await this.nextRecommendedTeamsRepository.getNextRecommendedTeamByUserId(userId);

    return nextRecommendedTeam;
  }

  // 다음 추천팀을 추천팀 테이블로 이동
  async updateRecommendedTeamIdsByUserId(userId: number): Promise<void> {
    const nextRecommendedTeam = await this.getNextRecommendedTeamByUserId(userId);
    const nextRecommendedTeamIds = nextRecommendedTeam.nextRecommendedTeamIds;

    // 추천팀 없는 경우 생성 or 기존 추천팀 업데이트
    await this.recommendedTeamsRepository.upsertRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
      userId,
      nextRecommendedTeamIds,
    );
  }

  async deleteNextRecommendedTeamIdsByUserId(userId: number): Promise<void> {
    await this.nextRecommendedTeamsRepository.deleteNextRecommendedTeamIdsByUserId(userId);
  }

  async getRecommendedTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const { recommendedTeamIds } = await this.getRecommendedTeamByUserId(userId);

    // 추천팀 데이터가 없는 경우
    if (!recommendedTeamIds || recommendedTeamIds.length === 0) {
      return { teams: [] };
    }

    return this.teamsRepository.getRecommendedTeamCardsByRecommendedTeamIds(recommendedTeamIds);
  }

  async getTeamsByGenderForMatching(gender: TeamGender): Promise<{ teams: TeamForMatching[] }> {
    return this.teamsRepository.getTeamsByGenderForMatching(gender);
  }

  async upsertRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
    userId: number,
    recommendedTeamIds: number[],
  ): Promise<void> {
    // 추천팀 없는 경우 생성 or 기존 추천팀 업데이트
    return this.recommendedTeamsRepository.upsertRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
      userId,
      recommendedTeamIds,
    );
  }

  async upsertNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
    userId: number,
    nextRecommendedTeamIds: number[],
  ): Promise<void> {
    // 다음 추천팀 없는 경우 생성 or 기존 추천팀 업데이트
    return this.nextRecommendedTeamsRepository.upsertNextRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
      userId,
      nextRecommendedTeamIds,
    );
  }

  async updateRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
    userId: number,
    recommendedTeamIds: number[],
  ): Promise<void> {
    return this.recommendedTeamsRepository.updateRecommendedTeamIdsByUserIdAndRecommendedTeamIds(
      userId,
      recommendedTeamIds,
    );
  }

  async updateNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
    userId: number,
    nextRecommendedTeamIds: number[],
  ): Promise<void> {
    return this.nextRecommendedTeamsRepository.updateNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
      userId,
      nextRecommendedTeamIds,
    );
  }

  // 추천팀 찾은 후 업데이트
  // matchingTeam: 추천팀 정보 업데이트하려는 팀, matchedTeams: 매칭 대상이 되는 팀들
  async matchTeam(matchingTeam: TeamForMatching, matchedTeams: TeamForMatching[], next: boolean = true) {
    // 0. 예외 처리 된 팀 제외하기
    const availableTeams = matchedTeams.filter((matchedTeam) => {
      return (
        !matchedTeam.excludedTeamIds?.includes(matchingTeam.id) &&
        !matchingTeam.excludedTeamIds?.includes(matchedTeam.id)
      );
    });

    // 1. 지역 일치하는 팀 조회
    const areaSameTeamIds = availableTeams
      .filter((matchedTeam) => {
        return matchingTeam.areas.some((a) => matchedTeam.areas.includes(a));
      })
      .map((t) => t.id);

    // 지역 일치하는 팀 수가 최대 추천팀 수(4명) 이하인 경우 바로 저장 및 중단
    if (areaSameTeamIds.length <= TEAM_LIMIT.MAX_RECOMMENDED_TEAM) {
      // next flag가 true인 경우, 다음 추천팀 정보 저장
      if (next) {
        await this.upsertNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(matchingTeam.ownerId, areaSameTeamIds);
      }
      // next flag가 false인 경우, 추천팀 정보 저장
      else if (!next) {
        await this.upsertRecommendedTeamIdsByUserIdAndRecommendedTeamIds(matchingTeam.ownerId, areaSameTeamIds);
      }
      return;
    }

    // 2. 인원 일치하는 팀 조회
    matchingTeam.memberCounts?.push(matchingTeam.memberCount);
    const memberCountsSameTeamIds = availableTeams
      .filter((availableTeam) => {
        availableTeam.memberCounts?.push(availableTeam.memberCount);
        return matchingTeam.memberCounts?.some((m) => availableTeam.memberCounts?.includes(m));
      })
      .map((t) => t.id);

    // 3. 나이 일치하는 팀 조회
    const ageSameTeamIds = availableTeams
      .filter((availableTeam) => {
        return (
          matchingTeam.prefAge[0] <= availableTeam.age &&
          availableTeam.age <= matchingTeam.prefAge[1] &&
          availableTeam.prefAge[0] <= matchingTeam.age &&
          matchingTeam.age <= availableTeam.prefAge[1]
        );
      })
      .map((t) => t.id);

    // 4. 일정 일치하는 팀 조회
    const dateSameTeamIds = availableTeams
      .filter((availableTeam) => {
        return matchingTeam.availableDate?.some((a) => availableTeam.availableDate?.includes(a));
      })
      .map((t) => t.id);

    // [가장 잘 맞는 팀 조회]
    // 1순위: 지역 + 인원 + 나이 + 일정
    // 2순위: 지역 + 인원 + 나이
    // 3순위: 지역 + 인원
    // 4순위: 지역만
    const areaMemberCountsSameTeamIds = intersection(areaSameTeamIds, memberCountsSameTeamIds);
    const areaMemberCountsAgeSameTeamIds = intersection(areaMemberCountsSameTeamIds, ageSameTeamIds);
    const areaMemberCountsAgeDateSameTeamIds = intersection(areaMemberCountsAgeSameTeamIds, dateSameTeamIds);

    // 가장 잘 맞는 팀 2팀 조회
    const bestRecommendedTeamIds = take(
      uniq(
        concat(
          areaMemberCountsAgeDateSameTeamIds,
          areaMemberCountsAgeSameTeamIds,
          areaMemberCountsSameTeamIds,
          areaSameTeamIds,
        ),
      ),
      TEAM_LIMIT.BEST_RECOMMENDED_TEAM,
    );

    // [덜 맞는 팀 조회]
    // 1순위: 지역만
    // 2순위: 지역 + 인원만
    // 3순위: 지역 + 인원 + 나이만
    // 4순위: 지역 + 인원 + 나이 + 일정
    const onlyAreaSameTeams = difference(areaSameTeamIds, memberCountsSameTeamIds, ageSameTeamIds, dateSameTeamIds);
    const onlyAreaMemberCountsSameTeams = difference(areaSameTeamIds, ageSameTeamIds, dateSameTeamIds);
    const onlyAreaMemberCountsAgeSameTeams = difference(areaSameTeamIds, dateSameTeamIds);
    const onlyAreaMemberCountsAgeDateSameTeams = areaSameTeamIds;

    // 덜 맞는 팀 2팀 조회
    const otherRecommendedTeamIds = take(
      uniq(
        concat(
          onlyAreaSameTeams,
          onlyAreaMemberCountsSameTeams,
          onlyAreaMemberCountsAgeSameTeams,
          onlyAreaMemberCountsAgeDateSameTeams,
        ),
      ),
      TEAM_LIMIT.OTHER_RECOMMENDED_TEAM,
    );

    // next flag가 true인 경우, 다음 추천팀(가장 잘 맞는팀 + 덜 맞는 팀) 정보 저장
    if (next) {
      const nextRecommendedTeamIds = uniq(concat(bestRecommendedTeamIds, otherRecommendedTeamIds));
      await this.upsertNextRecommendedTeamIdsByUserIdAndNextRecommendedTeamIds(
        matchingTeam.ownerId,
        nextRecommendedTeamIds,
      );
    }
    // next flag가 false인 경우, 추천팀(가장 잘 맞는팀 + 덜 맞는 팀) 정보 저장
    else if (!next) {
      const recommendedTeamIds = uniq(concat(bestRecommendedTeamIds, otherRecommendedTeamIds));
      await this.upsertRecommendedTeamIdsByUserIdAndRecommendedTeamIds(matchingTeam.ownerId, recommendedTeamIds);
    }
  }
}
