import { ApiProperty } from '@nestjs/swagger';

export class AdminGetMatchingDto {
  @ApiProperty({
    description: '매칭 ID',
    example: 1,
  })
  matchingId: number;

  @ApiProperty({
    description: '우리팀 ID',
    example: 2,
  })
  teamId: number;

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
    description: '상대팀 ID',
    example: 2,
  })
  partnerTeamId: number;

  @ApiProperty({
    description: '상대팀 대표 유저 닉네임',
    example: '미팅이',
  })
  partnerTeamOwner: string;

  @ApiProperty({
    description: '상대팀 대표 핸드폰 번호',
    example: '01012345678',
  })
  partnerTeamOwnerPhone: string;

  @ApiProperty({
    description: '신청일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  appliedAt: Date;
}