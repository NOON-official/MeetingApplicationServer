import { Order } from './../orders/entities/order.entity';
import { User } from './../users/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from './repositories/tickets.repository';
import { Ticket } from './entities/ticket.entity';
import { GetTicketDto } from './dtos/get-ticket.dto';

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

  async getTicketById(ticketId: number): Promise<Ticket> {
    return this.ticketsRepository.getTicketById(ticketId);
  }

  async deleteTicketById(ticketId: number): Promise<void> {
    const ticket = await this.getTicketById(ticketId);

    // 해당 이용권 정보가 없는 경우
    if (!ticket || !!ticket.deletedAt) {
      throw new NotFoundException(`Can't find ticket with id ${ticketId}`);
    }

    await this.ticketsRepository.deleteTicketById(ticketId);
  }

  async deleteTicketsByUserIdAndDeleteLimit(userId: number, deleteLimit: number): Promise<void> {
    // deleteLimit 개수만큼 삭제
    await this.ticketsRepository.deleteTicketsByUserIdAndDeleteLimit(userId, deleteLimit);
  }

  async deleteTicketsByUserId(userId: number): Promise<void> {
    return this.ticketsRepository.deleteTicketsByUserId(userId);
  }

  async getAllTickets(): Promise<{ tickets: GetTicketDto[] }> {
    return this.ticketsRepository.getAllTickets();
  }
}
