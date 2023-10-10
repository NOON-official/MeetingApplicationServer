import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPassDto {
  @ApiProperty({
    description: '처리 코드',
    example: '0000',
  })
  @IsNotEmpty()
  @IsString()
  readonly res_cd: string;

  @ApiProperty({
    description: '처리 메세지',
    example: '정상처리',
  })
  @IsNotEmpty()
  @IsString()
  readonly res_msg: string;

  @ApiProperty({
    description: '핸드폰 번호',
    example: '01012345678',
  })
  @IsNotEmpty()
  @IsString()
  readonly phone_no: string;

  @ApiProperty({
    description: '유저 이름',
    example: '미팅이',
  })
  @IsNotEmpty()
  @IsString()
  readonly user_name: string;

  @ApiProperty({
    description: '생년월일',
    example: '19961230',
  })
  @IsNotEmpty()
  @IsString()
  readonly birth_day: string;

  @ApiProperty({
    description: '성별',
    example: '01',
  })
  @IsNotEmpty()
  @IsString()
  readonly sex_code: string;
}
