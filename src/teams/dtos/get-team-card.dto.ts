import { ApiProperty } from '@nestjs/swagger';

export class GetTeamCardDto {
  @ApiProperty({
    description: '팀 아이디',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '매칭 아이디',
    example: 1,
  })
  matchingId: number;

  @ApiProperty({
    description: '팀 이름',
    example: '아름이와 아이들',
  })
  teamName: string;

  @ApiProperty({
    description: '평균 나이',
    example: 24,
  })
  age: number;

  @ApiProperty({
    description: '인원 수',
    example: 3,
  })
  memberCount: number;

  @ApiProperty({
    description: '한 줄 소개',
    example: '안녕하세요',
  })
  intro: string;

  @ApiProperty({
    description: '학교 인증',
    example: true,
    required: true,
  })
  readonly isVerified: boolean;

  @ApiProperty({
    description: '신청일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  appliedAt: Date;
}
