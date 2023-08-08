import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SaveStudentCardDto {
  @ApiProperty({
    description: '학생증 이미지가 저장된 url',
    example: 'https://meetingo.me/images/23.png',
  })
  @IsNotEmpty()
  @IsString()
  readonly studentCardUrl: string;
}
