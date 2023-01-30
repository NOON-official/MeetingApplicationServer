import { Order } from './../orders/entities/order.entity';
import { User } from './../users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { TicketsRepository } from './repositories/tickets.repository';

@Injectable()
export class TicketsService {
  constructor(private ticketsRepository: TicketsRepository) {}

  async getTicketCountByUserId(userId: number): Promise<{ ticketCount: number }> {
    return this.ticketsRepository.getTicketCountByUserId(userId);
  }

  async createTickets(ticketCount: number, user: User, order: Order): Promise<void> {
    return this.ticketsRepository.createTickets(ticketCount, user, order);
  }
}
