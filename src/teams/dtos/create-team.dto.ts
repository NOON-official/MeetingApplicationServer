import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  ValidateNested,
  IsDate,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({
    description: '포지션',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(4)
  readonly role: number;

  @ApiProperty({
    description: 'MBTI',
    example: 13,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(16)
  readonly mbti: number;

  @ApiProperty({
    description: '닮은꼴',
    example: '차은우',
  })
  @IsOptional()
  @IsString()
  readonly appearance?: string;

  @ApiProperty({
    description: '나이',
    example: 23,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(19)
  @Max(29)
  readonly age: number;
}

export class CreateTeamDto {
  @ApiProperty({
    description: '성별',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(2)
  readonly gender: number;

  @ApiProperty({
    description: '인원수',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(3)
  readonly memberCount: number;

  @ApiProperty({
    description: '대학교',
    example: [1, 42, 345],
    required: true,
  })
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(450, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(3)
  readonly universities?: number[];

  @ApiProperty({
    description: '미팅 선호 날짜',
    example: ['2023-01-23', '2023-01-24', '2023-01-25', '2023-01-26'],
    required: true,
  })
  @IsNotEmpty()
  @IsDate({ each: true })
  @ArrayMinSize(4)
  readonly availableDates: string[];

  @ApiProperty({
    description: '지역',
    example: [1, 3],
    required: true,
  })
  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  readonly areas: number[];

  @ApiProperty({
    type: [CreateMemberDto],
    description: '멤버',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMemberDto)
  @ArrayMinSize(2)
  @ArrayMaxSize(3)
  readonly members: CreateMemberDto[];

  @ApiProperty({
    description: '한 줄 소개',
    example: '안녕하세요',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly intro: string;

  @ApiProperty({
    description: '주량 레벨',
    example: 5,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  readonly drink: number;

  @ApiProperty({
    description: '상대방 학교',
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly prefSameUniversity: boolean;

  @ApiProperty({
    description: '상대방 선호 나이',
    example: [23, 27],
    required: true,
  })
  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(20, { each: true })
  @Max(29, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  readonly prefAge: number[];

  @ApiProperty({
    description: '분위기',
    example: [1, 2, 5],
    required: true,
  })
  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  readonly prefVibes: number[];
}
