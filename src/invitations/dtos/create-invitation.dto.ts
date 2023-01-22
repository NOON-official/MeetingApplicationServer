import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: '초대한 유저 ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly inviterId: number;

  @ApiProperty({
    description: '초대받은 유저 ID',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly inviteeId: number;
}
