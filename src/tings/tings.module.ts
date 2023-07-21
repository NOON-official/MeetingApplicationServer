import { Module } from '@nestjs/common';
import { TingsService } from './tings.service';
import { TypeOrmExModule } from 'src/database/typeorm-ex.module';
import { TingsRepository } from './repositories/tings.repository';
import { TingsController } from './tings.controller';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([TingsRepository])],
  providers: [TingsService],
  controllers: [TingsController],
  exports: [TingsService],
})
export class TingsModule {}
