import { ApiProperty } from '@nestjs/swagger';
export class AdminGetTeamDto {
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
    description: '카카오 아이디',
    example: 'k_woong',
  })
  kakaoId: string;

  @ApiProperty({
    description: '팀 이름',
    example: '한솔이와 친구들',
  })
  teamName: string;

  @ApiProperty({
    description: '한 줄 소개',
    example: '안녕하세요',
  })
  intro: string;

  @ApiProperty({
    description: '인원수',
    example: 2,
  })
  memberCount: number;

  @ApiProperty({
    description: '가능 인원수',
    example: [3, 4],
  })
  memberCounts: number[];

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  phone: string;

  @ApiProperty({
    description: '우리팀 평균 나이',
    example: 23,
  })
  averageAge: number;

  @ApiProperty({
    description: '상대방 선호 나이',
    example: [23, 27],
  })
  prefAge: number[];

  @ApiProperty({
    description: '지역',
    example: [1, 3],
  })
  areas: number[];

  @ApiProperty({
    description: '대학교',
    example: [1, 42, 345],
  })
  universities?: number[];

  @ApiProperty({
    description: '주량 레벨',
    example: 5,
  })
  drink: number;

  @ApiProperty({
    description: '상대팀 ID',
    example: 2,
  })
  partnerTeamId?: number;

  @ApiProperty({
    description: '신청일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  appliedAt: Date;

  @ApiProperty({
    description: '매칭일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  matchedAt?: Date;

  @ApiProperty({
    description: '매칭 실패일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  failedAt?: Date;

  @ApiProperty({
    description: '거절당한 일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  refusedAt?: Date;

  @ApiProperty({
    description: '회원 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '거절한 회원 ID들',
    example: [11, 22, 33],
  })
  refusedUserIds?: number[] | null;
}
