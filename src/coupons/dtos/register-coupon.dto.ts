import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class RegisterCouponDto {
  @ApiProperty({
    description: '유저ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly userId: number;

  @ApiProperty({
    description: '쿠폰 코드',
    example: 'ABCD1234',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly code: string;
}
