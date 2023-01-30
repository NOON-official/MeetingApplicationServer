import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Ticket } from '../entities/ticket.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';

@CustomRepository(Ticket)
export class TicketsRepository extends Repository<Ticket> {
  async getTicketCountByUserId(userId: number): Promise<{ ticketCount: number }> {
    const ticketCount = await this.createQueryBuilder('ticket')
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.usedAt IS NULL')
      .getCount();

    return { ticketCount };
  }

  async createTickets(ticketCount: number, user: User, order: Order): Promise<void> {
    const tickets = [];

    for (let i = 0; i < ticketCount; i++) {
      tickets.push({ user, order });
    }

    await this.createQueryBuilder('ticket').insert().into(Ticket).values(tickets).execute();
  }
}
