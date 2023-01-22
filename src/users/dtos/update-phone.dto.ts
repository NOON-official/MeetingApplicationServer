import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdatePhoneDto extends PickType(CreateUserDto, ['phone'] as const) {}
