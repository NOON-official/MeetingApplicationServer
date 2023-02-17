import { ApiProperty } from '@nestjs/swagger';

export class AdminGetInvitationSuccessUserDto {
  @ApiProperty({
    description: '유저 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '4명 초대 성공 일시 (최근순)',
    example: '2023-01-20T21:37:26.886Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '유저 닉네임',
    example: '미팅이',
  })
  nickname: string;

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  phone: string;

  @ApiProperty({
    description: '4명 채운 횟수',
    example: 3,
  })
  invitationSuccessCount: number;
}
