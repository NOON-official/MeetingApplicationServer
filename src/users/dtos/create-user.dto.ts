import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 1355387,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly kakaoUid: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly nickname: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty()
  @IsString()
  readonly gender?: string;

  @ApiProperty()
  @IsString()
  readonly ageRange?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly referralId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly refreshToken?: string;
}
