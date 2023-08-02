import { ApiProperty } from '@nestjs/swagger';

export class DeleteMatchingDto {
  @ApiProperty({
    description: '매칭 Id',
    example: 1,
  })
  matchingId: number;
}
