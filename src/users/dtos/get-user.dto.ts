import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class GetUserTingHistoryDto {
  @ApiProperty({
    description: 'Case',
    example: '회원가입',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly case: string;

  @ApiProperty({
    description: '구매 혹은 사용 ting',
    example: 20,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly usingTing: number;
}
