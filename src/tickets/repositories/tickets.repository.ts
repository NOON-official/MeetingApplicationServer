import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Ticket } from '../entities/ticket.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import * as moment from 'moment-timezone';
import { GetTicketDto } from '../dtos/get-ticket.dto';

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

  async getTicketByUserId(userId: number): Promise<Ticket> {
    const ticket = await this.createQueryBuilder('ticket')
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.usedAt IS NULL')
      .orderBy('ticket.id', 'ASC')
      .getOne();

    return ticket;
  }

  async useTicketById(ticketId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Ticket)
      .set({ usedAt: moment().format() })
      .where('id = :ticketId', { ticketId })
      .execute();
  }

  async refundTicketById(ticketId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Ticket)
      .set({ usedAt: null })
      .where('id = :ticketId', { ticketId })
      .execute();
  }

  async getTicketById(ticketId: number): Promise<Ticket> {
    const ticket = this.findOne({
      where: {
        id: ticketId,
      },
      withDeleted: true,
    });
    return ticket;
  }

  async deleteTicketById(ticketId: number): Promise<void> {
    await this.createQueryBuilder('ticket').softDelete().from(Ticket).where('id = :ticketId', { ticketId }).execute();
  }

  async deleteTicketsByUserIdAndDeleteLimit(userId: number, deleteLimit: number): Promise<void> {
    await this.createQueryBuilder('ticket')
      .select()
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.usedAt IS NULL')
      .andWhere('ticket.deletedAt IS NULL')
      .orderBy('ticket.createdAt', 'ASC')
      .limit(deleteLimit)
      .softDelete()
      .execute();
  }

  async deleteTicketsByUserId(userId: number): Promise<void> {
    await this.createQueryBuilder('ticket')
      .select()
      .where('ticket.userId = :userId', { userId })
      .softDelete()
      .execute();
  }

  async getAllTickets(): Promise<{ tickets: GetTicketDto[] }> {
    const tickets = await this.createQueryBuilder('ticket')
      .select('ticket.userId AS userId')
      .addSelect('COUNT(*) AS ticketCount')
      .where('ticket.usedAt IS NULL')
      .groupBy('userId')
      .getRawMany();
    return { tickets };
  }
}
