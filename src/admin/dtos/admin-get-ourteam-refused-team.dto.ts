import { ApiProperty } from '@nestjs/swagger';

export class AdminGetOurteamRefusedTeamDto {
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
    description: '성별',
    example: '남',
  })
  gender: string;

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  phone: string;

  @ApiProperty({
    description: '매칭 거절 이유 (여러개인 경우 "/"로 구분, 선택 안 한 경우 "무응답")',
    example: '학교 / 자기소개서 / 내부 사정 / 그냥',
  })
  matchingRefuseReason: string;

  @ApiProperty({
    description: '거절한 일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  refusedAt: Date;
}
