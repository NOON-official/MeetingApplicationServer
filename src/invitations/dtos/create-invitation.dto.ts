import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: '초대받은(로그인 한) 유저 ID',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  readonly userId: number;

  @ApiProperty({
    description: '추천인 코드',
    example: 'LD4GSTO3',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly referralId: string;
}
