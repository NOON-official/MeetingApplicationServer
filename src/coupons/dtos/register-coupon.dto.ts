import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCouponDto {
  @ApiProperty({
    description: '쿠폰 코드',
    example: 'ABCD1234',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly code: string;
}
