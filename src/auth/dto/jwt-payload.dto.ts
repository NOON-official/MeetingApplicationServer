import { IsNotEmpty } from 'class-validator';
import { IsNumber, IsString } from 'class-validator/types/decorator/decorators';

export class JwtPayload {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  sub: number;
}
