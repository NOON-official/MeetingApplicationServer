import { ApiProperty } from '@nestjs/swagger';

export class getMemberDto {
  @ApiProperty({
    description: '포지션',
    example: 1,
  })
  role: number;

  @ApiProperty({
    description: 'MBTI',
    example: 13,
  })
  mbti: number;

  @ApiProperty({
    description: '닮은꼴',
    example: '차은우',
  })
  appearance?: string;

  @ApiProperty({
    description: '나이',
    example: 23,
  })
  age: number;
}

export class GetTeamDto {
  @ApiProperty({
    description: '팀 아이디',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '팀 생성 유저아이디',
    example: 1,
  })
  ownerId: number;

  @ApiProperty({
    description: '성별',
    example: 1,
  })
  gender: number;

  @ApiProperty({
    description: '인원수',
    example: 2,
  })
  memberCount: number;

  @ApiProperty({
    description: '대학교',
    example: [1, 42, 345],
  })
  universities?: number[];

  @ApiProperty({
    description: '미팅 선호 날짜',
    example: ['2023-01-22', '2023-01-23', '2023-01-24'],
  })
  availableDates: Date[];

  @ApiProperty({
    description: '지역',
    example: [1, 3],
  })
  areas: number[];

  @ApiProperty({
    type: [getMemberDto],
    description: '멤버',
  })
  members: getMemberDto[];

  @ApiProperty({
    description: '한 줄 소개',
    example: '안녕하세요',
  })
  intro: string;

  @ApiProperty({
    description: '주량 레벨',
    example: 5,
  })
  drink: number;

  @ApiProperty({
    description: '상대방 학교',
    example: 1,
  })
  prefSameUniversity: number;

  @ApiProperty({
    description: '상대방 선호 나이 최솟값',
    example: 23,
  })
  prefMinAge: number;

  @ApiProperty({
    description: '상대방 선호 나이 최댓값',
    example: 27,
  })
  prefMaxAge: number;

  @ApiProperty({
    description: '분위기',
    example: [1, 2, 5],
  })
  prefVibes: number[];

  @ApiProperty({
    description: '시작 라운드',
    example: 1,
  })
  startRound: number;

  @ApiProperty({
    description: '현재 라운드',
    example: 2,
  })
  currentRound: number;

  @ApiProperty({
    description: '생성일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '삭제일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  deletedAt?: Date;
}
