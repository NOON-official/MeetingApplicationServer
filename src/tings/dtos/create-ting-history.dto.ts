import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateTingHistoryDto {
  @ApiProperty({
    description: '유저 아이디',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    description: 'case',
    example: '회원가입',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly case: string;

  @ApiProperty({
    description: '사용한 팅 개수',
    example: 20,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly usingTing: number;
}
