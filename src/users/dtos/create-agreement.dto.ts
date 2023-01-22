import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateAgreementDto {
  @ApiProperty({
    description: '서비스 이용약관 동의',
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly service: boolean;

  @ApiProperty({
    description: '개인정보 수집 및 이용 동의',
    example: false,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly privacy: boolean;

  @ApiProperty({
    description: '만 19세 이상 동의',
    example: false,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly age: boolean;

  @ApiProperty({
    description: '이벤트/혜택 정보 수신 동의',
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  readonly marketing: boolean;
}
