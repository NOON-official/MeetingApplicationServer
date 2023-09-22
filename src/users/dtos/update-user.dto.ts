import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: '이름',
    example: '미팅이',
  })
  @IsString()
  readonly nickname?: string;

  @ApiProperty({
    description: '성별',
    example: 'male',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly gender: string;

  @ApiProperty({
    description: '출생년도',
    example: 1996,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly birth: number;

  @ApiProperty({
    description: '전화번호',
    example: '01012345678',
  })
  @IsNotEmpty()
  @IsString()
  readonly phone?: string;
}

export class UpdateUniversityDto {
  @ApiProperty({
    description: '대학교',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly university: number;
}
