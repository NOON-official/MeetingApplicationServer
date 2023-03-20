import { AdminGetPartnerTeamNotRespondedTeamDto } from './../admin/dtos/admin-get-partner-team-not-responded-team.dto';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { MatchingsService } from './../matchings/matchings.service';
import { GetTeamDto } from './dtos/get-team.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { MatchingRound } from './../matchings/constants/matching-round';
import { CreateTeamDto } from './dtos/create-team.dto';
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
import { TeamAvailableDatesRepository } from './repositories/team-available-dates.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminGetOurteamRefusedTeamDto } from 'src/admin/dtos/admin-get-ourteam-refused-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    private teamsRepository: TeamsRepository,
    private teamAvailableDatesRepository: TeamAvailableDatesRepository,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => MatchingsService))
    private matchingsService: MatchingsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto, userId: number): Promise<void> {
    const {
      gender,
      memberCount,
      universities,
      areas,
      intro,
      drink,
      prefSameUniversity,
      prefAge,
      prefVibes,
      availableDates,
      members,
    } = createTeamDto;

    // 이미 매칭중인 팀이 있는 경우
    const existingTeam = await this.teamsRepository.getTeamIdByUserId(userId);
    if (!!existingTeam.teamId) {
      throw new BadRequestException('team is already exists');
    }

    const user = await this.usersService.getUserById(userId);

    // 팀 정보 저장
    const { teamId } = await this.teamsRepository.createTeam(
      { gender, memberCount, universities, areas, intro, drink, prefSameUniversity, prefAge, prefVibes },
      user,
    );

    const team = await this.getTeamById(teamId);

    // 팀 가능 날짜 저장
    await this.teamsRepository.createTeamAvailableDate(availableDates, team);

    // 팀 멤버 저장
    await this.teamsRepository.createTeamMember(members, team);

    // 신청팀 수가 다 찼을 경우 매칭 알고리즘 실행 - 자동화 적용 시 주석 해제하기
    // this.eventEmitter.emit('team.created');
  }

  // 신청 내역 조회
  async getTeamsByUserId(userId: number): Promise<{ teams: UserTeam[] }> {
    const { teamsWithMatching } = await this.teamsRepository.getTeamsByUserId(userId);
    const teams = teamsWithMatching.map((t) => ({
      id: t.id,
      memberCount: t.memberCount,
      createdAt: t.createdAt,
      chatCreatedAt: (t.maleTeamMatching || t.femaleTeamMatching)?.chatCreatedAt ?? null,
    }));

    return { teams };
  }

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    return this.teamsRepository.getTeamIdByUserId(userId);
  }

  async getMembersCountOneWeek(): Promise<{ memberCount: number }> {
    return this.teamsRepository.getMembersCountOneWeek();
  }

  async getMembersCountTotal(): Promise<{ memberCount: number }> {
    return this.teamsRepository.getMembersCountTotal();
  }

  async getTeamCountByStatusAndMembercountAndGender(
    status: MatchingStatus.APPLIED,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teamCount: number }> {
    return this.teamsRepository.getTeamCountByStatusAndMembercountAndGender(status, membercount, gender);
  }

  async getTeamCount(): Promise<{
    teamsPerRound: number;
    '2vs2': { male: number; female: number };
    '3vs3': { male: number; female: number };
  }> {
    const teamsPerRound = MatchingRound.MAX_TEAM;

    let { teamCount: male2 } = await this.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '2',
      TeamGender.male,
    );

    // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
    if (male2 < MatchingRound.MIN_TEAM) male2 = MatchingRound.MIN_TEAM;
    if (male2 > MatchingRound.MAX_TEAM) male2 = MatchingRound.MAX_TEAM;

    let { teamCount: female2 } = await this.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '2',
      TeamGender.female,
    );

    // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
    if (female2 < MatchingRound.MIN_TEAM) female2 = MatchingRound.MIN_TEAM;
    if (female2 > MatchingRound.MAX_TEAM) female2 = MatchingRound.MAX_TEAM;

    let { teamCount: male3 } = await this.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '3',
      TeamGender.male,
    );

    // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
    if (male3 < MatchingRound.MIN_TEAM) male3 = MatchingRound.MIN_TEAM;
    if (male3 > MatchingRound.MAX_TEAM) male3 = MatchingRound.MAX_TEAM;

    let { teamCount: female3 } = await this.getTeamCountByStatusAndMembercountAndGender(
      MatchingStatus.APPLIED,
      '3',
      TeamGender.female,
    );

    // 최소 팀 수 미만인 경우 OR 최대 팀 수 이상인 경우 값 조정
    if (female3 < MatchingRound.MIN_TEAM) female3 = MatchingRound.MIN_TEAM;
    if (female3 > MatchingRound.MAX_TEAM) female3 = MatchingRound.MAX_TEAM;

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

  async getTeamPagedata(): Promise<{
    Genders: teamPagedata[];
    Universities: teamPagedata[];
    Areas: teamPagedata[];
    Mbties: teamPagedata[];
    Roles: teamPagedata[];
    SameUniversities: teamPagedata[];
    Vibes: teamPagedata[];
  }> {
    return { Genders, Universities, Areas, Mbties, Roles, SameUniversities, Vibes };
  }

  async updateTeam(teamId: number, updateTeamDto: UpdateTeamDto): Promise<void> {
    const team = await this.getTeamById(teamId);

    // 해당 팀 정보가 없는 경우
    if (!team || !!team.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${teamId}`);
    }

    // 이미 매칭 완료된 팀인 경우
    if (!!team.maleTeamMatching || !!team.femaleTeamMatching) {
      throw new BadRequestException(`already matched team`);
    }

    // 이미 매칭 실패한 팀인 경우
    if (team.currentRound - team.startRound >= MatchingRound.MAX_TRIAL) {
      throw new BadRequestException(`matching already failed team`);
    }

    const {
      gender,
      memberCount,
      universities,
      areas,
      intro,
      drink,
      prefSameUniversity,
      prefAge,
      prefVibes,
      availableDates,
      members,
    } = updateTeamDto;

    // Team 테이블 정보 업데이트
    await this.teamsRepository.updateTeam(teamId, {
      gender,
      memberCount,
      universities,
      areas,
      intro,
      drink,
      prefSameUniversity,
      prefAge,
      prefVibes,
    });

    // 팀 가능 날짜 정보 있는 경우 row 삭제 후 다시 생성
    if (!!availableDates) {
      await this.teamsRepository.deleteTeamAvailableDateByTeamId(teamId);
      await this.teamsRepository.createTeamAvailableDate(availableDates, team);
    }

    // 팀 멤버 정보 있는 경우 row 삭제 후 다시 생성
    if (!!members) {
      await this.teamsRepository.deleteTeamMemberByTeamId(teamId);
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
    team['availableDates'] = team.teamAvailableDates.map((d) => d.teamAvailableDate);

    delete Object.assign(team, { ['members']: team['teamMembers'] })['teamMembers']; // 프로퍼티 이름 변경
    delete team.user;
    delete team.teamAvailableDates;
    delete team.maleTeamMatching;
    delete team.femaleTeamMatching;

    const result = Object.assign(team);

    return result;
  }

  async reapplyTeam(teamId: number): Promise<void> {
    // 1. 기존 팀 정보 가져오기
    const existingTeam = await this.getApplicationTeamById(teamId);
    if (!!existingTeam.deletedAt) {
      throw new NotFoundException(`Can't find team with id ${teamId}`);
    }

    const user = await this.usersService.getUserById(existingTeam.ownerId);

    const newTeamData = {
      gender: existingTeam.gender,
      memberCount: existingTeam.memberCount,
      universities: existingTeam.universities,
      areas: existingTeam.areas,
      intro: existingTeam.intro,
      drink: existingTeam.drink,
      prefSameUniversity: existingTeam.prefSameUniversity,
      prefAge: existingTeam.prefAge,
      prefVibes: existingTeam.prefVibes,
    };

    // 2. 새로운 팀 생성하기
    const { teamId: newTeamId } = await this.teamsRepository.createTeam(newTeamData, user);
    const newTeam = await this.getTeamById(newTeamId);

    // 팀 가능 날짜 저장
    await this.teamsRepository.createTeamAvailableDate(existingTeam.availableDates, newTeam);

    // 팀 멤버 저장
    const newMembers = existingTeam.members.map((m) => {
      return { role: m.role, mbti: m.mbti, appearance: m.appearance, age: m.age };
    });
    await this.teamsRepository.createTeamMember(newMembers, newTeam);

    // 3. 기존 팀 삭제하기(soft delete)
    await this.deleteTeamById(teamId);

    // 신청팀 수가 다 찼을 경우 매칭 알고리즘 실행 - 자동화 적용 시 주석 해제하기
    // this.eventEmitter.emit('team.created');
  }

  async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
    return this.matchingsService.getMatchingIdByTeamId(teamId);
  }

  async getTeamsByStatusAndMembercountAndGender(
    status: MatchingStatus,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    // 신청자 조회
    if (status === MatchingStatus.APPLIED) {
      return this.teamsRepository.getAppliedTeamsByMembercountAndGender(membercount, gender);
    }

    // 수락/거절 대기자 조회
    if (status === MatchingStatus.MATCHED) {
      return this.teamsRepository.getMatchedTeamsByMembercountAndGender(membercount, gender);
    }

    // 매칭 실패 회원 조회
    if (status === MatchingStatus.FAILED) {
      return this.teamsRepository.getFailedTeamsByMembercountAndGender(membercount, gender);
    }

    // 거절 당한 회원 조회
    if (status === MatchingStatus.PARTNER_TEAM_REFUSED) {
      return this.teamsRepository.getPartnerTeamRefusedTeamsByMembercountAndGender(membercount, gender);
    }
  }

  async getOurteamRefusedTeams(): Promise<{ teams: AdminGetOurteamRefusedTeamDto[] }> {
    return this.matchingsService.getMatchingRefuseReasons();
  }

  async getMaxRound(): Promise<{ maxRound: number }> {
    return this.teamsRepository.getMaxRound();
  }

  async getAvailableDates(teamId: number): Promise<Date[]> {
    const availableDates = await this.teamAvailableDatesRepository.findBy({ teamId: teamId });
    return availableDates.map((availableDate) => availableDate.teamAvailableDate);
  }

  async updateCurrentRound(teamIds: number[], currentRound: number): Promise<void> {
    return this.teamsRepository.updateCurrentRound(teamIds, currentRound);
  }

  async updateLastFailReasons(teamIds: number[], reasons: string[]): Promise<void> {
    return this.teamsRepository.updateLastFailReasons(teamIds, reasons);
  }

  // 상대팀 무응답이고 아직 환불받지 않은 팀 조회
  async getPartnerTeamNotRespondedTeamsByGender(
    gender: TeamGender,
  ): Promise<{ teams: AdminGetPartnerTeamNotRespondedTeamDto[] }> {
    return this.teamsRepository.getPartnerTeamNotRespondedTeamsByGender(gender);
  }

  async deleteTeamsByUserId(userId: number): Promise<void> {
    return this.teamsRepository.deleteTeamsByUserId(userId);
  }
}
