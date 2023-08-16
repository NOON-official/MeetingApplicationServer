import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateTingDto {
  @ApiProperty({
    description: '유저 아이디',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    description: '팅 개수',
    example: 20,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly tingCount: number;
}
