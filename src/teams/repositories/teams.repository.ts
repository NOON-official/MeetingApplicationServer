import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { CreateMemberDto } from './../dtos/create-team.dto';
import { CreateTeam } from './../interfaces/create-team.interface';
import { TeamMember } from './../entities/team-member.entity';
import { TeamAvailableDate } from './../entities/team-available-date.entity';
import { Team } from './../entities/team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TeamGender } from '../entities/team-gender.enum';
import { MatchingRound } from 'src/matchings/constants/matching-round';
import { UpdateTeam } from '../interfaces/update-team.interface';
import { AdminGetTeamDto } from 'src/admin/dtos/admin-get-team.dto';

@CustomRepository(Team)
export class TeamsRepository extends Repository<Team> {
  // 최대 라운드 조회
  async getMaxRound(): Promise<{ maxRound: number }> {
    let { maxRound } = await this.createQueryBuilder('team').select('MAX(team.currentRound)', 'maxRound').getRawOne();

    if (!maxRound) {
      maxRound = 0;
    }

    return { maxRound };
  }

  // 팀 정보 저장
  async createTeam(teamData: CreateTeam, user: User): Promise<{ teamId: number }> {
    const { maxRound } = await this.getMaxRound();

    const result = await this.createQueryBuilder()
      .insert()
      .into(Team)
      .values({
        ...teamData,
        startRound: maxRound,
        currentRound: maxRound,
        user,
      })
      .execute();
    return { teamId: result.identifiers[0].id };
  }

  // 팀 정보 조회
  async getTeamById(teamId: number): Promise<Team> {
    const team = this.findOne({
      where: {
        id: teamId,
      },
      withDeleted: true,
    });
    return team;
  }

  // 팀 가능 날짜 저장
  async createTeamAvailableDate(teamAvailableDates: string[], team: Team): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(TeamAvailableDate)
      .values(
        teamAvailableDates.map((date) => {
          return { teamAvailableDate: date, team };
        }),
      )
      .execute();
  }

  // 팀 멤버 저장
  async createTeamMember(members: CreateMemberDto[], team: Team): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(TeamMember)
      .values(
        members.map((m) => {
          return { ...m, team };
        }),
      )
      .execute();
  }

  // 유저 신청 내역 조회
  async getTeamsByUserId(userId: number): Promise<{ teamsWithMatching: Team[] }> {
    // 팀 성별 가져오기
    const result = await this.createQueryBuilder('team')
      .select('team.gender')
      .where('team.ownerId = :userId', { userId })
      .withDeleted()
      .getOne();

    const teamGender = result?.gender ?? null; // 신청 정보가 없는 경우 null 저장

    // 팀 + 매칭 기록 조회
    const teamsWithMatching = await this.createQueryBuilder('team')
      .leftJoinAndSelect(teamGender === 1 ? 'team.maleTeamMatching' : 'team.femaleTeamMatching', 'matching')
      .where('team.ownerId = :userId', { userId })
      .withDeleted()
      .getMany();

    return { teamsWithMatching };
  }

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    const result = await this.createQueryBuilder('team')
      .select('team.id')
      .where('team.ownerId = :userId', { userId })
      .getOne();

    const teamId = result?.id || null;

    return { teamId };
  }

  async getMembersCountOneWeek(): Promise<{ memberCount: number }> {
    let { memberCount } = await this.createQueryBuilder('team')
      .select('SUM(team.memberCount) AS memberCount')
      .where('DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= team.createdAt')
      .withDeleted()
      .getRawOne();

    memberCount ? (memberCount = Number(memberCount)) : (memberCount = 0);

    return { memberCount };
  }

  async getTeamsCountByStatusAndMembercountAndGender(
    status: MatchingStatus.APPLIED,
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teamCount: number }> {
    const qb = this.createQueryBuilder('team');

    // 인원수 & 성별 필터링
    qb.leftJoinAndSelect(`team.${gender}TeamMatching`, 'matching')
      .where('memberCount = :membercount', { membercount })
      .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 });

    // 매칭 신청자인 경우
    if (status === MatchingStatus.APPLIED) {
      // 매칭 정보 X
      qb.andWhere('matching.id IS NULL');
      // 매칭 실패 횟수 3회 미만
      qb.andWhere('team.currentRound - team.startRound < :maxTrial', { maxTrial: MatchingRound.MAX_TRIAL });
    }

    const teamCount = await qb.getCount();

    return { teamCount };
  }

  async updateTeam(teamId: number, teamData: UpdateTeam): Promise<void> {
    await this.createQueryBuilder().update(Team).set(teamData).where('id = :teamId', { teamId }).execute();
  }

  async deleteTeamAvailableDateByTeamId(teamId: number): Promise<void> {
    await this.createQueryBuilder('team-available-date')
      .delete()
      .from(TeamAvailableDate)
      .where('teamId = :teamId', { teamId })
      .execute();
  }

  async deleteTeamMemberByTeamId(teamId: number): Promise<void> {
    await this.createQueryBuilder('team-available-date')
      .delete()
      .from(TeamMember)
      .where('teamId = :teamId', { teamId })
      .execute();
  }

  async deleteTeamById(teamId: number): Promise<void> {
    await this.createQueryBuilder('team').softDelete().from(Team).where('id = :teamId', { teamId }).execute();
  }

  // 관리자페이지 신청자 조회
  async getAppliedTeamsByMembercountAndGender(
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS teamId',
        '(team.currentRound - team.startRound) AS matchingCount',
        'user.nickname AS nickname',
        'team.intro AS intro',
        'team.memberCount AS memberCount',
        'user.phone AS phone',
        'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
        'team.prefAge AS prefAge',
        'team.areas AS areas',
        'team.universities AS universities',
        'team.prefSameUniversity AS prefSameUniversity',
        'team.drink AS drink',
        `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
        'team.createdAt AS appliedAt',
        'matching.createdAt AS matchedAt',
      ])
      .leftJoin(`team.${gender}TeamMatching`, 'matching')
      .leftJoin(`team.user`, 'user')
      .leftJoin('team.teamMembers', 'members')
      // 성별, 인원수 필터링
      .where('memberCount = :membercount', { membercount })
      .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
      //  신청자 조회 (매칭 내역 X & 매칭 실패 횟수 3회 미만)
      .andWhere('matching.id IS NULL')
      .andWhere('team.currentRound - team.startRound < :maxTrial', { maxTrial: MatchingRound.MAX_TRIAL })
      .groupBy('team.id')
      .getRawMany();

    teams.map((t) => {
      t.matchingCount = Number(t.matchingCount);
      t.averageAge = Number(t.averageAge);
      t.prefSameUniversity = Boolean(t.prefSameUniversity);
      t.failedAt = null; // 신청자 프로퍼티 추가
      t.refusedAt = null; // 신청자 프로퍼티 추가
    });

    return { teams };
  }

  // 관리자페이지 수락/거절 대기자 조회
  async getMatchedTeamsByMembercountAndGender(
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS teamId',
        '(team.currentRound - team.startRound) AS matchingCount',
        'user.nickname AS nickname',
        'team.intro AS intro',
        'team.memberCount AS memberCount',
        'user.phone AS phone',
        'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
        'team.prefAge AS prefAge',
        'team.areas AS areas',
        'team.universities AS universities',
        'team.prefSameUniversity AS prefSameUniversity',
        'team.drink AS drink',
        `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
        'team.createdAt AS appliedAt',
        'matching.createdAt AS matchedAt',
      ])
      .leftJoin(`team.${gender}TeamMatching`, 'matching')
      .leftJoin(`team.user`, 'user')
      .leftJoin('team.teamMembers', 'members')
      // 성별, 인원수 필터링
      .where('memberCount = :membercount', { membercount })
      .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
      //  수락/거절 대기자 조회 (매칭 내역 O & 우리팀 무응답 & 상대팀 거절X)
      .andWhere('matching.id IS NOT NULL')
      .andWhere(`matching.${gender}TeamIsAccepted IS NULL`)
      .andWhere(`matching.${gender === 'male' ? 'female' : 'male'}TeamIsAccepted IS NOT false`)
      // 매칭된지 24시간 이내인 경우만
      .andWhere('DATE_ADD(matching.createdAt, INTERVAL 1 DAY) > NOW()')
      .groupBy('team.id')
      .getRawMany();

    teams.map((t) => {
      t.matchingCount = Number(t.matchingCount);
      t.averageAge = Number(t.averageAge);
      t.prefSameUniversity = Boolean(t.prefSameUniversity);
      t.failedAt = null; // 수락/거절 대기자 프로퍼티 추가
      t.refusedAt = null; // 수락/거절 대기자 프로퍼티 추가
    });

    return { teams };
  }

  // 관리자페이지 매칭 실패 회원 조회
  async getFailedTeamsByMembercountAndGender(
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS teamId',
        '(team.currentRound - team.startRound) AS matchingCount',
        'user.nickname AS nickname',
        'team.intro AS intro',
        'team.memberCount AS memberCount',
        'user.phone AS phone',
        'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
        'team.prefAge AS prefAge',
        'team.areas AS areas',
        'team.universities AS universities',
        'team.prefSameUniversity AS prefSameUniversity',
        'team.drink AS drink',
        `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
        'team.createdAt AS appliedAt',
        'matching.createdAt AS matchedAt',
        'team.updatedAt AS failedAt',
      ])
      .leftJoin(`team.${gender}TeamMatching`, 'matching')
      .leftJoin(`team.user`, 'user')
      .leftJoin('team.teamMembers', 'members')
      // 성별, 인원수 필터링
      .where('memberCount = :membercount', { membercount })
      .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
      // 매칭 실패 회원 조회 (매칭 내역 X & 매칭 실패 횟수 3회 이상)
      .andWhere('matching.id IS NULL')
      .andWhere('team.currentRound - team.startRound >= :maxTrial', { maxTrial: MatchingRound.MAX_TRIAL })
      .groupBy('team.id')
      .getRawMany();

    teams.map((t) => {
      t.matchingCount = Number(t.matchingCount);
      t.averageAge = Number(t.averageAge);
      t.prefSameUniversity = Boolean(t.prefSameUniversity);
      t.refusedAt = null; // 수락/거절 대기자 프로퍼티 추가
    });

    return { teams };
  }

  // 관리자페이지 거절 당한 회원 조회
  async getPartnerTeamRefusedTeamsByMembercountAndGender(
    membercount: '2' | '3',
    gender: TeamGender,
  ): Promise<{ teams: AdminGetTeamDto[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS teamId',
        '(team.currentRound - team.startRound) AS matchingCount',
        'user.nickname AS nickname',
        'team.intro AS intro',
        'team.memberCount AS memberCount',
        'user.phone AS phone',
        'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
        'team.prefAge AS prefAge',
        'team.areas AS areas',
        'team.universities AS universities',
        'team.prefSameUniversity AS prefSameUniversity',
        'team.drink AS drink',
        `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
        'team.createdAt AS appliedAt',
        'matching.createdAt AS matchedAt',
        `IF(matching.${
          gender === 'male' ? 'female' : 'male'
        }TeamIsAccepted IS NULL, DATE_ADD(matching.createdAt, INTERVAL 1 DAY), matching.updatedAt) AS refusedAt`, // 무응답인 경우 매칭일시 + 1일을 거절 시간으로 반환
      ])
      .leftJoin(`team.${gender}TeamMatching`, 'matching')
      .leftJoin(`team.user`, 'user')
      .leftJoin('team.teamMembers', 'members')
      // 성별, 인원수 필터링
      .where('memberCount = :membercount', { membercount })
      .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
      //  거절 당한 회원 조회 (매칭 내역 O & 상대팀 거절/무응답)
      .andWhere('matching.id IS NOT NULL')
      // 우리팀이 거절한 경우는 제외
      .andWhere(`matching.${gender}TeamIsAccepted IS NOT false`)
      // 상대팀이 거절했거나 OR 우리팀이 수락하고 상대팀이 24시간 이내 무응답한 경우
      .andWhere(
        `matching.${
          gender === 'male' ? 'female' : 'male'
        }TeamIsAccepted IS false OR (matching.${gender}TeamIsAccepted IS true AND matching.${
          gender === 'male' ? 'female' : 'male'
        }TeamIsAccepted IS NULL AND DATE_ADD(matching.createdAt, INTERVAL 1 DAY) < NOW())`,
      )
      .groupBy('team.id')
      .getRawMany();

    teams.map((t) => {
      t.matchingCount = Number(t.matchingCount);
      t.averageAge = Number(t.averageAge);
      t.prefSameUniversity = Boolean(t.prefSameUniversity);
      t.failedAt = null; // 거절 당한 회원 프로퍼티 추가
    });

    return { teams };
  }

  async updateCurrentRound(teamIds: number[], currentRound: number): Promise<void> {
    await this.createQueryBuilder().update(Team).whereInIds(teamIds).set({ currentRound }).execute();
  }
}
