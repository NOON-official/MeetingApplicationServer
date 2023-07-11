import { Module } from '@nestjs/common';
import { TingsService } from './tings.service';

@Module({
  providers: [TingsService]
})
export class TingsModule {}
