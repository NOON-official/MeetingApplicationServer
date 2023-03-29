import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt, IsISO8601, Length, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({
    description: '쿠폰 타입 (쿠폰 페이지데이터 내 id 값)',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly couponTypeId: number;

  @ApiProperty({
    description: '쿠폰 코드',
    example: 'GIFT',
  })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  readonly couponCode?: string;

  @ApiProperty({
    description: '쿠폰 만료 일자',
    example: '2023-02-07',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  @Length(10, 10)
  readonly expiresAt?: Date;
}
