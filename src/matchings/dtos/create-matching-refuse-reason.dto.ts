import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateMatchingRefuseReasonDto {
  @ApiProperty({
    description: '거절 이유1 선택여부',
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly reason1: boolean;

  @ApiProperty({
    description: '거절 이유2 선택여부',
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly reason2: boolean;

  @ApiProperty({
    description: '거절 이유3 선택여부',
    example: false,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly reason3: boolean;

  @ApiProperty({
    description: '기타',
    example: '그냥',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly other?: string;
}
