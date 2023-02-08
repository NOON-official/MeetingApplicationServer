import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';

export class TossPaymentsDto {
  @ApiProperty({
    description: '토스페이먼츠 결제 ID',
    example: '11GeAjmZaKKSiqvyPb1TY',
  })
  @IsString()
  readonly paymentKey: string;

  @ApiProperty({
    description: '토스페이먼츠 결제 금액',
    example: 9000,
  })
  @IsNumber()
  readonly amount: number;

  @ApiProperty({
    description: '토스페이먼츠 주문 ID',
    example: '038ffFL08Dwp-6WIBYPWU',
  })
  @IsString()
  readonly orderId: string;
}
export class CreateOrderDto {
  @ApiProperty({
    description: '상품 타입(이용권 구매 페이지데이터 id값)',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(4)
  readonly productId: number;

  @ApiProperty({
    description: '상품 가격',
    example: 5000,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(30000)
  readonly price: number;

  @ApiProperty({
    description: '할인 가격',
    example: 5000,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(30000)
  readonly discountAmount: number;

  @ApiProperty({
    description: '최종 결제 가격',
    example: 0,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(30000)
  readonly totalAmount: number;
  @ApiProperty({
    description: '사용한 쿠폰 ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  readonly couponId?: number;

  @ApiProperty({
    description: '토스페이먼츠 결제 정보 \n\n 결제정보가 없는 경우(0원) null 가능',
  })
  @IsOptional()
  readonly toss?: TossPaymentsDto;
}
