import { UsersService } from './users.service';
import { Controller } from '@nestjs/common';

@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}
}
