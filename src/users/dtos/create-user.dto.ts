import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: '카카오 유저아이디',
    example: 2385693417,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly kakaoUid: number;

  @ApiProperty({
    description: '카카오 닉네임',
    example: '미팅이',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly nickname: string;

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty({
    description: '카카오 성별',
    example: 'male',
  })
  @IsString()
  readonly gender?: string;

  @ApiProperty({
    description: '카카오 연령대',
    example: '20-29',
  })
  @IsString()
  readonly ageRange?: string;

  @ApiProperty({
    description: '추천인 코드',
    example: 'LD4GSTO3',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly referralId: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoi66y46rec7JuQIiwic3ViIjoxNDcsImlhdCI6MTY3NDAzMzczNywiZXhwIjoxNjc0MDQwOTM3fQ.Xvzy6JGnMK_av67jTuuQeRuPp7TZkExGgwnUnIWezpE',
  })
  @IsOptional()
  @IsString()
  readonly refreshToken?: string;
}
