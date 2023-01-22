import { CustomRepository } from 'src/database/typeorm-ex.decorator';
import { Ticket } from '../entities/ticket.entity';
import { Repository } from 'typeorm';

@CustomRepository(Ticket)
export class TicketsRepository extends Repository<Ticket> {}
