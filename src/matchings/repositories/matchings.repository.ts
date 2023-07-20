import { AdminGetMatchingDto } from './../../admin/dtos/admin-get-matching.dto';
import { Matching } from './../entities/matching.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import * as moment from 'moment-timezone';

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
}
