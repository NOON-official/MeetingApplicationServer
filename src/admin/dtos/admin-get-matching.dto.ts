import { ApiProperty } from '@nestjs/swagger';

export class AdminGetMatchingDto {
  @ApiProperty({
    description: '매칭 ID',
    example: 1,
  })
  matchingId: number;

  @ApiProperty({
    description: '남자팀 ID',
    example: 1,
  })
  maleTeamId: number;

  @ApiProperty({
    description: '남자팀 유저 닉네임',
    example: '미팅이1',
  })
  maleTeamNickname: string;

  @ApiProperty({
    description: '남자팀 핸드폰 번호',
    example: '01012345678',
  })
  maleTeamPhone: string;

  @ApiProperty({
    description: '여자팀 ID',
    example: 2,
  })
  femaleTeamId: number;

  @ApiProperty({
    description: '여자팀 유저 닉네임',
    example: '미팅이2',
  })
  femaleTeamNickname: string;

  @ApiProperty({
    description: '여자팀 핸드폰 번호',
    example: '01012345678',
  })
  femaleTeamPhone: string;

  @ApiProperty({
    description: '생성일시(매칭 시간)',
    example: '2023-01-20T21:37:26.886Z',
  })
  matchedAt: Date;

  @ApiProperty({
    description: '카톡방 생성여부',
    example: false,
  })
  chatIsCreated: boolean;
}
