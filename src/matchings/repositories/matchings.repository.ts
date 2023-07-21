import { AdminGetMatchingDto } from './../../admin/dtos/admin-get-matching.dto';
import { Matching } from './../entities/matching.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import * as moment from 'moment-timezone';
import { GetTeamCardDto } from 'src/teams/dtos/get-team-card.dto';

@CustomRepository(Matching)
export class MatchingsRepository extends Repository<Matching> {
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
      .leftJoinAndSelect('matching.maleTeam', 'maleTeam')
      .leftJoinAndSelect('matching.femaleTeam', 'femaleTeam')
      .leftJoinAndSelect('matching.maleTeamTicket', 'maleTeamTicket')
      .leftJoinAndSelect('matching.femaleTeamTicket', 'femaleTeamTicket')
      .where('matching.id = :matchingId', { matchingId })
      .getOne();

    return matching;
  }

  async acceptMatchingByGender(matchingId: number, gender: 'male' | 'female', ticket: Ticket): Promise<void> {
    // if (gender === 'male') {
    //   await this.createQueryBuilder()
    //     .update(Matching)
    //     .set({ maleTeamIsAccepted: true, maleTeamTicket: ticket })
    //     .where('id = :matchingId', { matchingId })
    //     .execute();
    // } else if (gender === 'female') {
    //   await this.createQueryBuilder()
    //     .update(Matching)
    //     .set({ femaleTeamIsAccepted: true, femaleTeamTicket: ticket })
    //     .where('id = :matchingId', { matchingId })
    //     .execute();
    // }
  }

  async refuseMatchingByGender(matchingId: number, gender: 'male' | 'female'): Promise<void> {
    // if (gender === 'male') {
    //   await this.createQueryBuilder()
    //     .update(Matching)
    //     .set({ maleTeamIsAccepted: false })
    //     .where('id = :matchingId', { matchingId })
    //     .execute();
    // } else if (gender === 'female') {
    //   await this.createQueryBuilder()
    //     .update(Matching)
    //     .set({ femaleTeamIsAccepted: false })
    //     .where('id = :matchingId', { matchingId })
    //     .execute();
    // }
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
  async getSucceededMatchings(): Promise<{ matchings: AdminGetMatchingDto[] }> {
    // const matchings = await this.createQueryBuilder('matching')
    //   .select([
    //     'matching.id AS matchingId',
    //     'maleTeam.id AS maleTeamId',
    //     'maleTeamUser.nickname AS maleTeamNickname',
    //     'maleTeamUser.phone AS maleTeamPhone',
    //     'femaleTeam.id AS femaleTeamId',
    //     'femaleTeamUser.nickname AS femaleTeamNickname',
    //     'femaleTeamUser.phone AS femaleTeamPhone',
    //     'matching.createdAt AS matchedAt',
    //     `IF(matching.chatCreatedAt IS NOT NULL, 'true', 'false') AS chatIsCreated`,
    //   ])
    //   // 매칭 그만두기한 팀도 조회해야 하므로 withDeleted 추가
    //   .withDeleted()
    //   .leftJoin('matching.maleTeam', 'maleTeam')
    //   .leftJoin('matching.femaleTeam', 'femaleTeam')
    //   .leftJoin('maleTeam.user', 'maleTeamUser')
    //   .leftJoin('femaleTeam.user', 'femaleTeamUser')
    //   // 매칭 완료자 조회 (상호 수락한 경우)
    //   .where('matching.maleTeamIsAccepted = true')
    //   .andWhere('matching.femaleTeamIsAccepted = true')
    //   // 삭제된 매칭은 조회 X
    //   .andWhere('matching.deletedAt IS NULL')
    //   .getRawMany();

    // matchings.map((m) => {
    //   m.chatIsCreated = m.chatIsCreated === 'true' ? true : false;
    // });

    return { matchings: [] };
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
        'receivedUser.isVerified AS isVerified',
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
      t.isVerified = t.isVerified === 1 ? true : false;
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
        'appliedUser.isVerified AS isVerified',
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
      t.isVerified = t.isVerified === 1 ? true : false;
    });

    return { teams };
  }
}
