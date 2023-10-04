import { AdminGetMatchingDto } from './../../admin/dtos/admin-get-matching.dto';
import { Matching } from './../entities/matching.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import * as moment from 'moment-timezone';
import { GetTeamCardDto } from 'src/teams/dtos/get-team-card.dto';
import { AdminGetAppliedTeamDto } from 'src/admin/dtos/admin-get-team.dto';

@CustomRepository(Matching)
export class MatchingsRepository extends Repository<Matching> {
  async getMatchings(): Promise<Matching[]> {
    return await this.find();
  }

  // 매칭 정보 조회(삭제된 팀 정보 포함)
  async getMatchingWithDeletedByTeamId(teamId: number): Promise<Matching> {
    const matching = await this.createQueryBuilder('matching')
      .withDeleted()
      .leftJoinAndSelect('matching.appliedTeam', 'appliedTeam')
      .leftJoinAndSelect('matching.receivedTeam', 'receivedTeam')
      .where('matching.appliedTeam = :teamId', { teamId })
      .orWhere('matching.receivedTeam = :teamId', { teamId })
      .getOne();

    return matching;
  }

  async getMatchingByTeamId(teamId: number): Promise<Matching> {
    const matching = await this.createQueryBuilder('matching')
      .leftJoinAndSelect('matching.appliedTeam', 'appliedTeam')
      .leftJoinAndSelect('matching.receivedTeam', 'receivedTeam')
      .where('matching.appliedTeam = :teamId', { teamId })
      .orWhere('matching.receivedTeam = :teamId', { teamId })
      .getOne();

    return matching;
  }

  async getReceivedMatchingsByTeamId(teamId: number): Promise<{ matchings: Matching[] }> {
    const matchings = await this.createQueryBuilder('matching')
      .leftJoinAndSelect('matching.receivedTeam', 'receivedTeam')
      .where('matching.receivedTeam = :teamId', { teamId })
      .andWhere('matching.appliedTeamIsAccepted = true AND matching.receivedTeamIsAccepted IS NULL')
      .getMany();

    return { matchings };
  }

  // 관리자페이지 신청한/신청받은 팀 조회
  async getAdminMatchingsApplied(): Promise<{ appliedandreceiveds: AdminGetAppliedTeamDto[] }> {
    const appliedandreceiveds = await this.createQueryBuilder('matching')
      .select([
        'matching.id AS matchingId',
        'appliedTeam.id AS teamId',
        'appliedTeamOwner.nickname as nickname',
        'appliedTeamOwner.phone as phone',
        'receivedTeam.id AS partnerTeamId',
        'receivedTeamOwner.nickname as partnerTeamOwnernickname',
        'receivedTeamOwner.phone as partnerTeamOwnerphone',
        `IF(matching.updatedAt IS NOT NULL, matching.updatedAt, matching.createdAt) AS appliedAt`,
      ])
      .leftJoin(`matching.appliedTeam`, 'appliedTeam')
      .leftJoin(`appliedTeam.user`, 'appliedTeamOwner')
      .leftJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin(`receivedTeam.user`, 'receivedTeamOwner')
      .where('matching.appliedTeamIsAccepted = true AND matching.receivedTeamIsAccepted IS NULL')
      .groupBy('matching.id')
      .orderBy('COALESCE(matching.updatedAt, matching.createdAt)', 'ASC') // updatedAt이 있는 경우 modifiedAt 기준
      .getRawMany();

    return { appliedandreceiveds };
  }

  // async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
  //   const result = await this.createQueryBuilder('matching')
  //     .select('matching.id')
  //     .where('matching.maleTeamId = :teamId', { teamId })
  //     .orWhere('matching.femaleTeamId = :teamId', { teamId })
  //     .getOne();

  //   const matchingId = result?.id || null;

  //   return { matchingId: 1 };
  // }

  async getMatchingById(matchingId: number): Promise<Matching> {
    const matching = await this.createQueryBuilder('matching')
      .withDeleted()
      .leftJoinAndSelect('matching.appliedTeam', 'appliedTeam')
      .leftJoinAndSelect('matching.receivedTeam', 'receivedTeam')
      .where('matching.id = :matchingId', { matchingId })
      .getOne();

    return matching;
  }

  async acceptMatching(matchingId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Matching)
      .set({ receivedTeamIsAccepted: true, receivedTeamIsPaid: true, matchedAt: () => 'NOW()' })
      .where('id = :matchingId', { matchingId })
      .execute();
  }

  async refuseMatching(matchingId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Matching)
      .set({ receivedTeamIsAccepted: false, receivedTeamIsPaid: false })
      .where('id = :matchingId', { matchingId })
      .execute();
  }

  // async deleteTicketInfoByMatchingIdAndGender(matchingId: number, gender: 'male' | 'female'): Promise<void> {
  //   if (gender === 'male') {
  //     await this.createQueryBuilder()
  //       .update(Matching)
  //       .set({ appliedTeamTicket: null })
  //       .where('id = :matchingId', { matchingId })
  //       .execute();
  //   } else if (gender === 'female') {
  //     await this.createQueryBuilder()
  //       .update(Matching)
  //       .set({ receivedTeamTicket: null })
  //       .where('id = :matchingId', { matchingId })
  //       .execute();
  //   }
  // }

  async deleteMatchingById(matchingId: number): Promise<void> {
    await this.createQueryBuilder('matching')
      .softDelete()
      .from(Matching)
      .where('id = :matchingId', { matchingId })
      .execute();
  }

  // 관리자페이지 매칭완료자 조회
  async getAdminSucceededMatchings(): Promise<{ matchings: AdminGetMatchingDto[] }> {
    const matchings = await this.createQueryBuilder('matching')
      .select([
        'matching.id AS matchingId',
        'appliedTeam.id AS teamId',
        'appliedTeamOwner.nickname as nickname',
        'appliedTeamOwner.phone as phone',
        'receivedTeam.id AS partnerTeamId',
        'receivedTeamOwner.nickname as partnerTeamOwnernickname',
        'receivedTeamOwner.phone as partnerTeamOwnerphone',
        'matching.matchedAt AS matchedAt',
      ])
      // 매칭 그만두기한 팀도 조회해야 하므로 withDeleted 추가
      .withDeleted()
      .leftJoin(`matching.appliedTeam`, 'appliedTeam')
      .leftJoin(`appliedTeam.user`, 'appliedTeamOwner')
      .leftJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin(`receivedTeam.user`, 'receivedTeamOwner')
      // 매칭 완료자 조회 (상호 수락한 경우)
      .where('matching.appliedTeamIsAccepted = true AND matching.receivedTeamIsAccepted = true')
      // 삭제된 매칭은 조회 X
      .andWhere('matching.deletedAt IS NULL')
      .getRawMany();

    return { matchings };
  }

  async updateChatCreatedAtByMatchingId(matchingId: number): Promise<void> {
    // await this.createQueryBuilder()
    //   .update(Matching)
    //   .set({ chatCreatedAt: moment().format() })
    //   .where('id = :matchingId', { matchingId })
    //   .execute();
  }

  async createMatchings(matchings: Matching[]): Promise<Matching[]> {
    return this.save(matchings);
  }

  async createMatching(matching: Matching): Promise<Matching> {
    return this.save(matching);
  }

  // async getMatchingAverageSecondsOneWeeks(): Promise<{ averageMatchedSeconds: number }> {
  //   // 남자팀 매칭 소요 시간(초) = 매칭된 시간 - 신청 시간(팀 정보 수정 시간)
  //   const maleTeamMatchedtimes = await this.createQueryBuilder('matching')
  //     .select([
  //       'TIME_TO_SEC(TIMEDIFF(matching.createdAt, IF(maleTeam.modifiedAt IS NOT NULL, maleTeam.modifiedAt, maleTeam.createdAt))) AS seconds',
  //     ])
  //     .withDeleted()
  //     .leftJoin('matching.maleTeam', 'maleTeam')
  //     // 일주일 이내
  //     .where('DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= matching.createdAt')
  //     // 24시간 이내 매칭된 경우
  //     .andWhere(
  //       'HOUR(TIMEDIFF(matching.createdAt, IF(maleTeam.modifiedAt IS NOT NULL, maleTeam.modifiedAt, maleTeam.createdAt))) <= 24',
  //     )
  //     .getRawMany();

  //   // 여자팀 매칭 소요 시간(초) = 매칭된 시간 - 신청 시간(팀 정보 수정 시간)
  //   const femaleTeamMatchedtimes = await this.createQueryBuilder('matching')
  //     .select([
  //       'TIME_TO_SEC(TIMEDIFF(matching.createdAt, IF(femaleTeam.modifiedAt IS NOT NULL, femaleTeam.modifiedAt, femaleTeam.createdAt))) AS seconds',
  //     ])
  //     .withDeleted()
  //     .leftJoin('matching.femaleTeam', 'femaleTeam')
  //     // 일주일 이내
  //     .where('DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= matching.createdAt')
  //     // 24시간 이내 매칭된 경우
  //     .andWhere(
  //       'HOUR(TIMEDIFF(matching.createdAt, IF(femaleTeam.modifiedAt IS NOT NULL, femaleTeam.modifiedAt, femaleTeam.createdAt))) <= 24',
  //     )
  //     .getRawMany();

  //   // 하루 이내 매칭 케이스 없는 경우
  //   if (maleTeamMatchedtimes.length === 0 && femaleTeamMatchedtimes.length === 0) {
  //     const averageMatchedSeconds = 31240;
  //     return { averageMatchedSeconds };
  //   }

  //   let matchedSeconds = 0; // 총 매칭 시간(초)
  //   for await (const maleTeamMatchedtime of maleTeamMatchedtimes) {
  //     matchedSeconds += Number(maleTeamMatchedtime.seconds);
  //   }
  //   for await (const femaleTeamMatchedtime of femaleTeamMatchedtimes) {
  //     matchedSeconds += Number(femaleTeamMatchedtime.seconds);
  //   }

  //   // 평균 매칭 시간(초)
  //   let averageMatchedSeconds = matchedSeconds / (maleTeamMatchedtimes.length + femaleTeamMatchedtimes.length);
  //   averageMatchedSeconds = Math.trunc(averageMatchedSeconds);

  //   return { averageMatchedSeconds };
  // }

  async getAppliedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const teams = await this.createQueryBuilder('matching')
      .select([
        'receivedTeam.id AS id',
        'matching.id AS matchingId',
        'receivedTeam.teamName AS teamName',
        'CAST(SUM(receivedMembers.age) / receivedTeam.memberCount AS SIGNED) AS age',
        'receivedTeam.memberCount AS memberCount',
        'receivedTeam.intro AS intro',
        'receivedUser.approval AS approval',
        'matching.createdAt AS appliedAt',
      ])
      .innerJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin('matching.appliedTeam', 'appliedTeam')
      .leftJoin('receivedTeam.user', 'receivedUser')
      .leftJoin('receivedTeam.teamMembers', 'receivedMembers')
      // 보낸 신청 조회
      .where('matching.appliedTeamId = :teamId', { teamId })
      .andWhere('matching.id IS NOT NULL')
      // 상대팀 무응답, 우리팀 수락
      .andWhere(`matching.receivedTeamIsAccepted IS NULL AND matching.appliedTeamIsAccepted IS true`)
      // 상대팀 결제 X, 우리팀 결제 O
      .andWhere(`matching.receivedTeamIsPaid IS NULL AND matching.appliedTeamIsPaid IS true`)
      .groupBy('matching.id')
      .getRawMany();

    teams.map((t) => {
      t.age = Number(t.age);
      t.approval = t.approval === 1 ? true : t.approval === 0 ? false : null;
    });

    return { teams };
  }

  async getRefusedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const teams = await this.createQueryBuilder('matching')
      .select([
        'receivedTeam.id AS id',
        'matching.id AS matchingId',
        'receivedTeam.teamName AS teamName',
        'CAST(SUM(receivedMembers.age) / receivedTeam.memberCount AS SIGNED) AS age',
        'receivedTeam.memberCount AS memberCount',
        'receivedTeam.intro AS intro',
        'receivedUser.approval AS approval',
        'matching.createdAt AS appliedAt',
      ])
      // soft delete 팀 포함
      .withDeleted()
      .innerJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin('matching.appliedTeam', 'appliedTeam')
      .leftJoin('receivedTeam.user', 'receivedUser')
      .leftJoin('receivedTeam.teamMembers', 'receivedMembers')
      // 거절당한 신청 조회
      .where('matching.appliedTeamId = :teamId', { teamId })
      .andWhere('matching.id IS NOT NULL')
      // 상대팀 거절, 우리팀 수락
      .andWhere(`matching.receivedTeamIsAccepted IS false AND matching.appliedTeamIsAccepted IS true`)
      // 상대팀 결제 X, 우리팀 결제 O
      .andWhere(`matching.receivedTeamIsPaid IS false AND matching.appliedTeamIsPaid IS true`)
      .groupBy('matching.id')
      .getRawMany();

    teams.map((t) => {
      t.age = Number(t.age);
      t.approval = t.approval === 1 ? true : t.approval === 0 ? false : null;
    });

    return { teams };
  }

  async getReceivedTeamCardsByTeamId(teamId: number): Promise<{ teams: GetTeamCardDto[] }> {
    const teams = await this.createQueryBuilder('matching')
      .select([
        'appliedTeam.id AS id',
        'matching.id AS matchingId',
        'appliedTeam.teamName AS teamName',
        'CAST(SUM(appliedMembers.age) / appliedTeam.memberCount AS SIGNED) AS age',
        'appliedTeam.memberCount AS memberCount',
        'appliedTeam.intro AS intro',
        'appliedUser.approval AS approval',
        'matching.createdAt AS appliedAt',
      ])
      .innerJoin('matching.appliedTeam', 'appliedTeam')
      .leftJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin('appliedTeam.user', 'appliedUser')
      .leftJoin('appliedTeam.teamMembers', 'appliedMembers')
      // 받은 신청 조회
      .where('matching.receivedTeamId = :teamId', { teamId })
      .andWhere('matching.id IS NOT NULL')
      // 상대팀 수락 O, 우리팀 무응답
      .andWhere(`matching.appliedTeamIsAccepted IS true AND matching.receivedTeamIsAccepted IS NULL`)
      // 상대팀 결제 O, 우리팀 결제 X
      .andWhere(`matching.appliedTeamIsPaid IS true AND matching.receivedTeamIsPaid IS NULL`)
      .groupBy('matching.id')
      .getRawMany();

    teams.map((t) => {
      t.age = Number(t.age);
      t.approval = t.approval === 1 ? true : t.approval === 0 ? false : null;
    });

    return { teams };
  }

  async getSucceededTeamCardsByUserId(userId: number): Promise<{ teams: GetTeamCardDto[] }> {
    // 내가 신청한 팀
    const appliedTeams = await this.createQueryBuilder('matching')
      .select([
        'receivedTeam.id AS id',
        'matching.id AS matchingId',
        'receivedTeam.teamName AS teamName',
        'CAST(SUM(receivedMembers.age) / receivedTeam.memberCount AS SIGNED) AS age',
        'receivedTeam.memberCount AS memberCount',
        'receivedTeam.intro AS intro',
        'receivedUser.approval AS approval',
        'matching.matchedAt AS matchedAt',
      ])
      .withDeleted()
      .leftJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin('matching.appliedTeam', 'appliedTeam')
      .leftJoin('receivedTeam.user', 'receivedUser')
      .leftJoin('receivedTeam.teamMembers', 'receivedMembers')
      // 상호 수락한 매칭 조회
      .where('appliedTeam.ownerId = :userId', { userId })
      // 상대팀 수락 O, 우리팀 수락 O
      .andWhere(`matching.appliedTeamIsAccepted IS true AND matching.receivedTeamIsAccepted IS true`)
      // 상대팀 결제 O, 우리팀 결제 O
      .andWhere(`matching.appliedTeamIsPaid IS true AND matching.receivedTeamIsPaid IS true`)
      // 상호 수락일시 기준 7일 이내 매칭만 조회
      .andWhere('DATE_ADD(matching.matchedAt, INTERVAL 7 DAY) > NOW()')
      .groupBy('matching.id')
      .getRawMany();

    // 내가 신청받은 팀
    const receivedTeams = await this.createQueryBuilder('matching')
      .select([
        'appliedTeam.id AS id',
        'matching.id AS matchingId',
        'appliedTeam.teamName AS teamName',
        'CAST(SUM(appliedMembers.age) / appliedTeam.memberCount AS SIGNED) AS age',
        'appliedTeam.memberCount AS memberCount',
        'appliedTeam.intro AS intro',
        'appliedUser.approval AS approval',
        'matching.matchedAt AS matchedAt',
      ])
      .withDeleted()
      .leftJoin('matching.appliedTeam', 'appliedTeam')
      .leftJoin('matching.receivedTeam', 'receivedTeam')
      .leftJoin('appliedTeam.user', 'appliedUser')
      .leftJoin('appliedTeam.teamMembers', 'appliedMembers')
      // 상호 수락한 매칭 조회
      .where('receivedTeam.ownerId = :userId', { userId })
      // 상대팀 수락 O, 우리팀 수락 O
      .andWhere(`matching.receivedTeamIsAccepted IS true AND matching.appliedTeamIsAccepted IS true`)
      // 상대팀 결제 O, 우리팀 결제 O
      .andWhere(`matching.receivedTeamIsPaid IS true AND matching.appliedTeamIsPaid IS true`)
      // 상호 수락일시 기준 7일 이내 매칭만 조회
      .andWhere('DATE_ADD(matching.matchedAt, INTERVAL 7 DAY) > NOW()')
      .groupBy('matching.id')
      .getRawMany();

    // 매칭 완료 팀 병합 및 내림차순 정렬
    let teams = appliedTeams.concat(receivedTeams);

    teams.map((t) => {
      t.age = Number(t.age);
      t.approval = t.approval === 1 ? true : t.approval === 0 ? false : null;
    });

    teams.sort((a, b) => {
      return b.matchedAt - a.matchedAt;
    });

    return { teams };
  }

  async getSucceededMatchings(): Promise<{ matchings: Matching[] }> {
    const matchings = await this.createQueryBuilder('matching')
      .select()
      // 상대팀 수락 O, 우리팀 수락 O
      .andWhere(`matching.receivedTeamIsAccepted IS true AND matching.appliedTeamIsAccepted IS true`)
      // 상대팀 결제 O, 우리팀 결제 O
      .andWhere(`matching.receivedTeamIsPaid IS true AND matching.appliedTeamIsPaid IS true`)
      .getMany();

    return { matchings };
  }
}
