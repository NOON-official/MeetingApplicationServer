import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsDate, IsInt } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({
    description: '쿠폰 타입 (쿠폰 페이지데이터 내 id 값)',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly type: number;

  @ApiProperty({
    description: '쿠폰 만료 일자',
    example: '2023-02-07',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly expiresAt: Date;
}
