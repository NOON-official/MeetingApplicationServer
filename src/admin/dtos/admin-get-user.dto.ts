import { ApiProperty } from '@nestjs/swagger';

export class AdminGetUserDto {
  @ApiProperty({
    description: '유저 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '유저 닉네임',
    example: '미팅이',
  })
  nickname: string;

  @ApiProperty({
    description: '유저 닉네임',
    example: 1996,
  })
  birth: number;

  @ApiProperty({
    description: '유저 대학교',
    example: '한국외국어대학교',
  })
  university: string;

  @ApiProperty({
    description: '유저 성별',
    example: '남자',
  })
  gender: string;

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  phone: string;

  @ApiProperty({
    description: '회원가입 일시',
    example: '2023-01-20T21:37:26.886Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '회원 코드',
    example: 'LD4GSTO3',
  })
  referralId: string;

  @ApiProperty({
    description: '팅 개수',
    example: 5,
  })
  tingCount: number;

  @ApiProperty({
    description: '50% 쿠폰 개수',
    example: 1,
  })
  discount50CouponCount: number;

  @ApiProperty({
    description: '무료 쿠폰 개수',
    example: 0,
  })
  freeCouponCount: number;

  @ApiProperty({
    description: '친구 초대 횟수',
    example: 1,
  })
  userInvitaionCount: number;
}
