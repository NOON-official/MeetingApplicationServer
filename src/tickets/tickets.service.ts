import { Order } from './../orders/entities/order.entity';
import { User } from './../users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { TicketsRepository } from './repositories/tickets.repository';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(private ticketsRepository: TicketsRepository) {}

  async getTicketCountByUserId(userId: number): Promise<{ ticketCount: number }> {
    return this.ticketsRepository.getTicketCountByUserId(userId);
  }

  async createTickets(ticketCount: number, user: User, order: Order): Promise<void> {
    return this.ticketsRepository.createTickets(ticketCount, user, order);
  }

  async getTicketByUserId(userId: number): Promise<Ticket> {
    return this.ticketsRepository.getTicketByUserId(userId);
  }

  async useTicketById(ticketId: number): Promise<void> {
    await this.ticketsRepository.useTicketById(ticketId);
  }

  async refundTicketById(ticketId: number): Promise<void> {
    await this.ticketsRepository.refundTicketById(ticketId);
  }
}
