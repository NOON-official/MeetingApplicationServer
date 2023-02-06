import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyPhoneCodeDto {
  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  readonly phone: string;

  @ApiProperty({
    description: '핸드폰 번호 인증 코드',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  readonly code: string;
}
