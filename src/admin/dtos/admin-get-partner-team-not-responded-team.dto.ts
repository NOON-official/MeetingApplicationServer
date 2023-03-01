import { TeamGender } from 'src/teams/entities/team-gender.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AdminGetPartnerTeamNotRespondedTeamDto {
  @ApiProperty({
    description: '팀 ID',
    example: 2,
  })
  teamId: number;

  @ApiProperty({
    description: '성별',
    example: 'male',
  })
  gender: TeamGender;

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  phone: string;

  @ApiProperty({
    description: '매칭 ID',
    example: 2,
  })
  matchingId: number;

  @ApiProperty({
    description: '사용한 이용권 ID',
    example: 2,
  })
  ticketId: number;
}
