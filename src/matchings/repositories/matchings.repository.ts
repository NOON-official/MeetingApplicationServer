import { Matching } from './../entities/matching.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Ticket } from 'src/tickets/entities/ticket.entity';

@CustomRepository(Matching)
export class MatchingsRepository extends Repository<Matching> {
  // 매칭 정보 조회(삭제된 팀 정보 포함)
  async getMatchingByTeamId(teamId: number): Promise<Matching> {
    const matching = await this.createQueryBuilder('matching')
      .withDeleted()
      .leftJoinAndSelect('matching.maleTeam', 'maleTeam')
      .leftJoinAndSelect('matching.femaleTeam', 'femaleTeam')
      .where('matching.maleTeamId = :teamId', { teamId })
      .orWhere('matching.femaleTeamId = :teamId', { teamId })
      .getOne();

    return matching;
  }

  async getMatchingIdByTeamId(teamId: number): Promise<{ matchingId: number }> {
    const result = await this.createQueryBuilder('matching')
      .select('matching.id')
      .where('matching.maleTeamId = :teamId', { teamId })
      .orWhere('matching.femaleTeamId = :teamId', { teamId })
      .getOne();

    const matchingId = result?.id || null;

    return { matchingId };
  }

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
    if (gender === 'male') {
      await this.createQueryBuilder()
        .update(Matching)
        .set({ maleTeamIsAccepted: true, maleTeamTicket: ticket })
        .where('id = :matchingId', { matchingId })
        .execute();
    } else if (gender === 'female') {
      await this.createQueryBuilder()
        .update(Matching)
        .set({ femaleTeamIsAccepted: true, femaleTeamTicket: ticket })
        .where('id = :matchingId', { matchingId })
        .execute();
    }
  }

  async refuseMatchingByGender(matchingId: number, gender: 'male' | 'female'): Promise<void> {
    if (gender === 'male') {
      await this.createQueryBuilder()
        .update(Matching)
        .set({ maleTeamIsAccepted: false })
        .where('id = :matchingId', { matchingId })
        .execute();
    } else if (gender === 'female') {
      await this.createQueryBuilder()
        .update(Matching)
        .set({ femaleTeamIsAccepted: false })
        .where('id = :matchingId', { matchingId })
        .execute();
    }
  }

  async deleteTicketInfoByGender(matchingId: number, gender: 'male' | 'female'): Promise<void> {
    if (gender === 'male') {
      await this.createQueryBuilder()
        .update(Matching)
        .set({ maleTeamTicket: null })
        .where('id = :matchingId', { matchingId })
        .execute();
    } else if (gender === 'female') {
      await this.createQueryBuilder()
        .update(Matching)
        .set({ femaleTeamTicket: null })
        .where('id = :matchingId', { matchingId })
        .execute();
    }
  }
}
