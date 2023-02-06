import { ApiProperty } from '@nestjs/swagger';

export class GetMatchingDto {
  @ApiProperty({
    description: '우리팀 ID',
    example: 1,
  })
  ourteamId: number;

  @ApiProperty({
    description: '상대팀 ID',
    example: 2,
  })
  partnerTeamId: number;

  @ApiProperty({
    description: '우리팀 수락여부',
    example: null,
  })
  ourteamIsAccepted?: boolean;

  @ApiProperty({
    description: '상대팀 수락여부',
    example: true,
  })
  partnerTeamIsAccepted?: boolean;

  @ApiProperty({
    description: '카톡방 생성일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  chatCreatedAt?: Date;

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
    example: null,
  })
  deletedAt?: Date;
}
