import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Ticket } from '../entities/ticket.entity';
import { Repository } from 'typeorm';

@CustomRepository(Ticket)
export class TicketsRepository extends Repository<Ticket> {
  async getTicketCountByUserId(userId: number): Promise<{ ticketCount: number }> {
    const ticketCount = await this.createQueryBuilder('ticket')
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.usedAt IS NULL')
      .getCount();

    return { ticketCount };
  }
}
