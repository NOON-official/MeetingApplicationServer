import { IsNumber } from 'class-validator/types/decorator/decorators';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsNumber()
  readonly kakaoUid: number;

  @IsNotEmpty()
  @IsString()
  readonly nickname: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsString()
  readonly gender?: string;

  @IsString()
  readonly ageRange?: string;

  @IsNotEmpty()
  @IsString()
  readonly referralId: string;

  @IsOptional()
  @IsString()
  readonly refreshToken?: string;
}
