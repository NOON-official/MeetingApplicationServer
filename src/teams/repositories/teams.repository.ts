import { AdminGetPartnerTeamNotRespondedTeamDto } from './../../admin/dtos/admin-get-partner-team-not-responded-team.dto';
import { MatchingStatus } from 'src/matchings/interfaces/matching-status.enum';
import { CreateMemberDto } from './../dtos/create-team.dto';
import { CreateTeam } from './../interfaces/create-team.interface';
import { TeamMember } from './../entities/team-member.entity';
import { Team } from './../entities/team.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { TeamGender } from '../entities/team-gender.enum';
import { MatchingRound } from 'src/matchings/constants/matching-round';
import { UpdateTeam } from '../interfaces/update-team.interface';
import { AdminGetTeamDto } from 'src/admin/dtos/admin-get-team.dto';
import { GetTeamOwnerDto } from '../dtos/get-team.dto';
import { GetTeamCardDto } from '../dtos/get-team-card.dto';
import { TeamForMatching } from '../interfaces/team-for-matching.interface';

@CustomRepository(Team)
export class TeamsRepository extends Repository<Team> {
  // 팀 정보 저장
  async createTeam(teamData: CreateTeam, user: User): Promise<{ teamId: number }> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(Team)
      .values({
        ...teamData,
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
    // // 팀 성별 가져오기
    // const result = await this.createQueryBuilder('team')
    //   .select('team.gender')
    //   .where('team.ownerId = :userId', { userId })
    //   .withDeleted()
    //   .getOne();

    // const teamGender = result?.gender ?? null; // 신청 정보가 없는 경우 null 저장

    // // 팀 + 매칭 기록 조회
    // const teamsWithMatching = await this.createQueryBuilder('team')
    //   .leftJoinAndSelect(teamGender === 1 ? 'team.maleTeamMatching' : 'team.femaleTeamMatching', 'matching')
    //   .where('team.ownerId = :userId', { userId })
    //   .orderBy({
    //     'team.createdAt': 'ASC',
    //   })
    //   .withDeleted()
    //   .getMany();

    // return { teamsWithMatching };
    return { teamsWithMatching: [] };
  }

  async getTeamIdByUserId(userId: number): Promise<{ teamId: number }> {
    const result = await this.createQueryBuilder('team')
      .select('team.id')
      .where('team.ownerId = :userId', { userId })
      .getOne();

    const teamId = result?.id || null;

    return { teamId };
  }

  // async getMembersCountOneWeek(): Promise<{ memberCount: number }> {
  //   let { memberCount } = await this.createQueryBuilder('team')
  //     .select('SUM(team.memberCount) AS memberCount')
  //     .where('DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= team.createdAt')
  //     .withDeleted()
  //     .getRawOne();

  //   memberCount ? (memberCount = Number(memberCount)) : (memberCount = 0);

  //   return { memberCount };
  // }

  async getMembersCountTotal(): Promise<{ memberCount: number }> {
    let { memberCount } = await this.createQueryBuilder('team')
      .select('SUM(team.memberCount) AS memberCount')
      .withDeleted()
      .getRawOne();

    memberCount ? (memberCount = Number(memberCount)) : (memberCount = 0);

    return { memberCount };
  }

  // async getTeamCountByStatusAndMembercountAndGender(
  //   status: MatchingStatus.APPLIED,
  //   membercount: '2' | '3' | '4',
  //   gender: TeamGender,
  // ): Promise<{ teamCount: number }> {
  //   const qb = this.createQueryBuilder('team');

  //   // 인원수 & 성별 필터링
  //   qb.leftJoinAndSelect(`team.${gender}TeamMatching`, 'matching')
  //     .where('memberCount = :membercount', { membercount })
  //     .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 });

  //   // 매칭 신청자인 경우
  //   if (status === MatchingStatus.APPLIED) {
  //     // 매칭 정보 X
  //     qb.andWhere('matching.id IS NULL');
  //   }

  //   const teamCount = await qb.getCount();

  //   return { teamCount };
  // }

  // async updateTeam(teamId: number, teamData: UpdateTeam): Promise<void> {
  //   await this.createQueryBuilder()
  //     .update(Team)
  //     .set({ ...teamData, modifiedAt: () => 'NOW()' })
  //     .where('id = :teamId', { teamId })
  //     .execute();
  // }

  async deleteTeamMemberByTeamId(teamId: number): Promise<void> {
    await this.createQueryBuilder('team-members')
      .delete()
      .from(TeamMember)
      .where('teamId = :teamId', { teamId })
      .execute();
  }

  async deleteTeamById(teamId: number): Promise<void> {
    await this.createQueryBuilder('team').softDelete().from(Team).where('id = :teamId', { teamId }).execute();
  }

  //관리자페이지 성별을 기준으로 모든 팀 조회
  async getTeamsByGender(gender: TeamGender): Promise<{ teams: AdminGetTeamDto[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS teamId',
        'user.nickname AS nickname',
        'team.kakaoId AS kakaoId',
        'team.teamName AS teamName',
        'team.intro AS intro',
        'team.memberCount AS memberCount',
        'team.memberCounts AS memberCounts',
        'user.phone AS phone',
        'user.age',
        'team.prefAge AS prefAge',
        'team.areas AS areas',
        'user.university AS university',
        'json_arrayagg(members.university) AS universities',
        'team.drink AS drink',
        `team.createdAt AS appliedAt`,
        'user.id AS userId',
      ])
      .leftJoin(`team.user`, 'user')
      .leftJoin('team.teamMembers', 'members')
      // 성별, 인원수 필터링
      .where('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
      //  신청자 조회 (매칭 내역 X & 매칭 최대 횟수 미만)
      .groupBy('team.id')
      .orderBy('COALESCE(team.modifiedAt, team.createdAt)', 'ASC') // modifiedAt이 있는 경우 modifiedAt 기준
      .getRawMany();

    teams.map((t) => {
      t.age = Number(t.age);
      t.universities = [t.university, ...t.universities];
    });

    return { teams };
  }

  // 관리자페이지 수락/거절 대기자 조회
  // async getMatchedTeamsByGender(gender: TeamGender): Promise<{ teams: AdminGetTeamDto[] }> {
  //   const teams = await this.createQueryBuilder('team')
  //     .select([
  //       'team.id AS teamId',
  //       'user.nickname AS nickname',
  //       'team.kakaoId AS kakaoId',
  //       'team.teamName AS teamName',
  //       'team.intro AS intro',
  //       'team.memberCount AS memberCount',
  //       'team.memberCounts AS memberCounts',
  //       'user.phone AS phone',
  //       'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
  //       'team.prefAge AS prefAge',
  //       'team.areas AS areas',
  //       'user.university AS university',
  //       'json_arrayagg(members.university) AS universities',
  //       'team.drink AS drink',
  //       `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
  //       `IF(team.modifiedAt IS NOT NULL, team.modifiedAt, team.createdAt) AS appliedAt`,
  //       'matching.createdAt AS matchedAt',
  //       'user.id AS userId',
  //       'user.refusedUserIds AS refusedUserIds',
  //     ])
  //     .leftJoin(`team.${gender}TeamMatching`, 'matching')
  //     .leftJoin(`team.user`, 'user')
  //     .leftJoin('team.teamMembers', 'members')
  //     // 성별, 인원수 필터링
  //     .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
  //     //  수락/거절 대기자 조회 (매칭 내역 O & 우리팀 무응답 & 상대팀 거절X)
  //     .andWhere('matching.id IS NOT NULL')
  //     .andWhere(`matching.${gender}TeamIsAccepted IS NULL`)
  //     .andWhere(`matching.${gender === 'male' ? 'female' : 'male'}TeamIsAccepted IS NOT false`)
  //     // 매칭된지 7일 이내인 경우만
  //     .andWhere('DATE_ADD(matching.createdAt, INTERVAL 7 DAY) > NOW()')
  //     .groupBy('team.id')
  //     .getRawMany();

  //   teams.map((t) => {
  //     t.averageAge = Number(t.averageAge);
  //     t.universities = [t.university, ...t.universities];
  //     t.failedAt = null; // 신청자 프로퍼티 추가
  //     t.refusedAt = null; // 신청자 프로퍼티 추가
  //   });

  //   return { teams };
  // }

  // // 관리자페이지 매칭 실패 회원 조회
  // async getFailedTeamsByMembercountAndGender(gender: TeamGender): Promise<{ teams: AdminGetTeamDto[] }> {
  //   const teams = await this.createQueryBuilder('team')
  //     .select([
  //       'team.id AS teamId',
  //       'user.nickname AS nickname',
  //       'team.kakaoId AS kakaoId',
  //       'team.teamName AS teamName',
  //       'team.intro AS intro',
  //       'team.memberCount AS memberCount',
  //       'team.memberCounts AS memberCounts',
  //       'user.phone AS phone',
  //       'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
  //       'team.prefAge AS prefAge',
  //       'team.areas AS areas',
  //       'user.university AS university',
  //       'json_arrayagg(members.university) AS universities',
  //       'team.drink AS drink',
  //       `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
  //       `IF(team.modifiedAt IS NOT NULL, team.modifiedAt, team.createdAt) AS appliedAt`,
  //       'matching.createdAt AS matchedAt',
  //       'user.id AS userId',
  //       'user.refusedUserIds AS refusedUserIds',
  //     ])
  //     .leftJoin(`team.${gender}TeamMatching`, 'matching')
  //     .leftJoin(`team.user`, 'user')
  //     .leftJoin('team.teamMembers', 'members')
  //     // 성별, 인원수 필터링
  //     .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
  //     // 매칭 실패 회원 조회 (매칭 내역 X & 매칭 최대 횟수 이상)
  //     .andWhere('matching.id IS NULL')
  //     .groupBy('team.id')
  //     .getRawMany();

  //   teams.map((t) => {
  //     t.averageAge = Number(t.averageAge);
  //     t.universities = [t.university, ...t.universities];
  //     t.refusedAt = null; // 수락/거절 대기자 프로퍼티 추가
  //   });

  //   return { teams };
  // }

  // 관리자페이지 거절 당한 회원 조회
  // async getPartnerTeamRefusedTeamsByGender(gender: TeamGender): Promise<{ teams: AdminGetTeamDto[] }> {
  //   const teams = await this.createQueryBuilder('team')
  //     .select([
  //       'team.id AS teamId',
  //       'user.nickname AS nickname',
  //       'team.kakaoId AS kakaoId',
  //       'team.teamName AS teamName',
  //       'team.intro AS intro',
  //       'team.memberCount AS memberCount',
  //       'team.memberCounts AS memberCounts',
  //       'user.phone AS phone',
  //       'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS averageAge',
  //       'team.prefAge AS prefAge',
  //       'team.areas AS areas',
  //       'user.university AS university',
  //       'json_arrayagg(members.university) AS universities',
  //       'team.drink AS drink',
  //       `${gender === 'male' ? 'matching.femaleTeamId' : 'matching.maleTeamId'} AS partnerTeamId`,
  //       `IF(team.modifiedAt IS NOT NULL, team.modifiedAt, team.createdAt) AS appliedAt`,
  //       'matching.createdAt AS matchedAt',
  //       'user.id AS userId',
  //       'user.refusedUserIds AS refusedUserIds',
  //     ])
  //     .leftJoin(`team.${gender}TeamMatching`, 'matching')
  //     .leftJoin(`team.user`, 'user')
  //     .leftJoin('team.teamMembers', 'members')
  //     // 성별, 인원수 필터링
  //     .andWhere('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
  //     // 거절 당한 회원 조회 (매칭 내역 O & 상대팀 거절/무응답)
  //     .andWhere('matching.id IS NOT NULL')
  //     // 우리팀이 거절한 경우는 제외
  //     .andWhere(`matching.${gender}TeamIsAccepted IS NOT false`)
  //     // 상대팀이 거절했거나 OR 우리팀이 수락하고 상대팀이 7일 이내 무응답한 경우
  //     .andWhere(
  //       `(matching.${
  //         gender === 'male' ? 'female' : 'male'
  //       }TeamIsAccepted IS false OR (matching.${gender}TeamIsAccepted IS true AND matching.${
  //         gender === 'male' ? 'female' : 'male'
  //       }TeamIsAccepted IS NULL AND DATE_ADD(matching.createdAt, INTERVAL 7 DAY) < NOW()))`,
  //     )
  //     .groupBy('team.id')
  //     .getRawMany();

  //   teams.map((t) => {
  //     t.averageAge = Number(t.averageAge);
  //     t.universities = [t.university, ...t.universities];
  //     t.failedAt = null; // 거절 당한 회원 프로퍼티 추가
  //   });

  //   return { teams };
  // }

  // 상대팀 무응답이고, 아직 환불되지 않은 팀 조회
  // async getPartnerTeamNotRespondedTeamsByGender(
  //   gender: TeamGender,
  // ): Promise<{ teams: AdminGetPartnerTeamNotRespondedTeamDto[] }> {
  //   const teams = await this.createQueryBuilder('team')
  //     .select([
  //       'team.id AS teamId',
  //       'team.gender AS gender',
  //       'user.phone AS phone',
  //       'matching.id AS matchingId',
  //       `${gender === 'male' ? 'matching.maleTeamTicketId' : 'matching.femaleTeamTicketId'} AS ticketId`,
  //     ])
  //     .leftJoin(`team.${gender}TeamMatching`, 'matching')
  //     .leftJoin(`team.user`, 'user')
  //     // 성별 필터링
  //     .where('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
  //     // 매칭 내역 O
  //     .andWhere('matching.id IS NOT NULL')
  //     // 우리팀이 수락하고 상대팀이 7일 이내 무응답한 경우
  //     .andWhere(
  //       `matching.${gender}TeamIsAccepted IS true AND matching.${
  //         gender === 'male' ? 'female' : 'male'
  //       }TeamIsAccepted IS NULL AND DATE_ADD(matching.createdAt, INTERVAL 7 DAY) < NOW()`,
  //     )
  //     // 아직 이용권 환불받지 않은 경우
  //     .andWhere(`matching.${gender}TeamTicketId IS NOT NULL`)
  //     .groupBy('team.id')
  //     .getRawMany();

  //   return { teams };
  // }

  async deleteTeamsByUserId(userId: number): Promise<void> {
    await this.createQueryBuilder('team').select().where('team.ownerId = :userId', { userId }).softDelete().execute();
  }

  async getOwnerId(teamId: number): Promise<GetTeamOwnerDto> {
    return this.createQueryBuilder('team').select('team.ownerId').where('team.id = :teamId', { teamId }).getOne();
  }

  async getExcludedTeamIds(teamId: number): Promise<{ excludedTeamIds: number[] }> {
    const result = await this.createQueryBuilder('team')
      .select(['team.excludedTeamIds'])
      .where('team.id = :teamId', { teamId })
      .getOne();

    const excludedTeamIds = result?.excludedTeamIds ?? [];

    return { excludedTeamIds };
  }

  async updateExcludedTeamIds(teamId: number, excludedTeamId: number) {
    // 거절(다시 안 보기)한 팀과, 거절(다시 안 보기) 당한 팀 모두 excludedTeamIds 업데이트
    const { excludedTeamIds: firstExcludedTeamIds } = await this.getExcludedTeamIds(teamId);
    const { excludedTeamIds: secondExcludedTeamIds } = await this.getExcludedTeamIds(excludedTeamId);

    if (!firstExcludedTeamIds.includes(excludedTeamId)) {
      await this.update({ id: teamId }, { excludedTeamIds: [...firstExcludedTeamIds, excludedTeamId] });
    }

    if (!secondExcludedTeamIds.includes(teamId)) {
      await this.update({ id: excludedTeamId }, { excludedTeamIds: [...secondExcludedTeamIds, teamId] });
    }
  }

  async getRecommendedTeamCardsByRecommendedTeamIds(
    recommendedTeamIds: number[],
  ): Promise<{ teams: GetTeamCardDto[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS id',
        'team.teamName AS teamName',
        'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS age',
        'team.memberCount AS memberCount',
        'team.intro AS intro',
        'user.approval AS approval',
        'team.createdAt AS createdAt',
      ])
      .leftJoin('team.user', 'user')
      .leftJoin('team.teamMembers', 'members')
      // 추천팀에 해당하는 팀 정보 조회
      .where('team.id IN (:...teamIds)', { teamIds: recommendedTeamIds })
      .groupBy('team.id')
      // 주어진 팀 번호 순서 그대로 정렬
      .orderBy(`FIELD(team.id,${recommendedTeamIds})`)
      .getRawMany();

    teams.map((t) => {
      t.age = Number(t.age);
      t.approval = t.approval === 1 ? true : t.approval === 0 ? false : null;
    });

    return { teams };
  }

  async getTeamsByGenderForMatching(gender: TeamGender): Promise<{ teams: TeamForMatching[] }> {
    const teams = await this.createQueryBuilder('team')
      .select([
        'team.id AS id',
        'team.ownerId AS ownerId',
        'team.gender AS gender',
        'CAST(SUM(members.age) / team.memberCount AS SIGNED) AS age',
        'team.memberCount AS memberCount',
        'team.memberCounts AS memberCounts',
        'team.teamAvailableDate AS availableDate',
        'team.areas AS areas',
        'team.prefAge AS prefAge',
        'team.excludedTeamIds AS excludedTeamIds',
        'team.createdAt AS createdAt',
      ])
      .leftJoin('team.teamMembers', 'members')
      // 성별에 해당하는 팀 정보 조회
      .where('team.gender = :genderNum', { genderNum: gender === TeamGender.male ? 1 : 2 })
      .groupBy('team.id')
      .orderBy('createdAt')
      .getRawMany();

    teams.map((t) => {
      t.age = Number(t.age);
      t.memberCounts = t.memberCounts ?? [];
      t.excludedTeamIds = t.excludedTeamIds ?? [];
    });

    return { teams };
  }
}
