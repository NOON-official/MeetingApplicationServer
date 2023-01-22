import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: '유저ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly userId: number;

  @ApiProperty({
    description: '토스페이먼츠 or 페이플 결제 ID \n\n 결제정보가 없는 경우(0원) null 가능',
    example: '5zJ4xY7m0kODnyRpQWGrN2xqGlNvLrKwv1M9ENjbeoPaZdL6',
  })
  @IsOptional()
  @IsString()
  readonly paymentId?: string;

  @ApiProperty({
    description: '구매 타입(이용권 구매 메타데이터 key값)',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(4)
  readonly type: number;

  @ApiProperty({
    description: '결제 가격',
    example: 9000,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(30000)
  readonly amount: number;

  @ApiProperty({
    description: '사용한 쿠폰 ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  readonly couponId?: number;
}
