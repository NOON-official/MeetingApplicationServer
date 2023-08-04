import { ApiProperty } from '@nestjs/swagger';

export class getMemberDto {
  @ApiProperty({
    description: '멤버 ID',
    example: 1,
  })
  id: number;

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
    description: '대학교',
    example: 1,
    required: true,
  })
  university: number;

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
    description: '인원 변경 가능',
    example: [2, 3],
  })
  memberCounts?: number[];

  @ApiProperty({
    description: '미팅 선호 일정',
    example: [1, 2],
    required: true,
  })
  teamAvailableDate: number[];

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
    description: '팀명',
    example: '기웅내세요',
    required: true,
  })
  teamName: string;

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
    description: '상대방 선호 나이',
    example: [23, 27],
  })
  prefAge: number[];

  @ApiProperty({
    description: '분위기',
    example: [1, 2, 5],
  })
  prefVibes: number[];

  @ApiProperty({
    description: '학교 인증',
    example: true,
    required: true,
  })
  readonly approval: boolean | null;

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

export class GetTeamDetailDto extends GetTeamDto {
  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  phone?: string;

  @ApiProperty({
    description: '카카오 아이디',
    example: 'kakaoID',
  })
  kakaoId?: string;
}

export class GetTeamOwnerDto {
  @ApiProperty({
    description: '팀 생성 유저아이디',
    example: 1,
  })
  ownerId: number;
}
