import { IsNotEmpty } from 'class-validator';
import { IsNumber, IsString } from 'class-validator/types/decorator/decorators';

export class KakaoProfileDto {
  @IsNotEmpty()
  @IsNumber()
  kakaoUid: number;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsString()
  ageRange?: string;

  @IsString()
  gender?: string;
}
