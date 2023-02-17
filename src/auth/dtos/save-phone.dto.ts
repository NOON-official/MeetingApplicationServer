import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SavePhoneDto {
  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  readonly phone: string;
}
