import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: '추천인 코드',
    example: 'LD4GSTO3',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly referralId: string;
}
