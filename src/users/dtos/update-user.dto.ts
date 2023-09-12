import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class UpdateUserDto {
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
