import { Module } from '@nestjs/common';
import { ContestModule } from '../contest/contest.module';
import { FreezeController } from './freeze.controller';
import { FreezeService } from './freeze.service';

@Module({
  imports: [ContestModule],
  controllers: [FreezeController],
  providers: [FreezeService],
})
export class FreezeModule {}
