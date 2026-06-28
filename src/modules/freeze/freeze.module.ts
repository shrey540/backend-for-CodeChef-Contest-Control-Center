import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ContestModule } from '../contest/contest.module';
import { FreezeController } from './freeze.controller';
import { FreezeService } from './freeze.service';

@Module({
  imports: [AuthModule, ContestModule],
  controllers: [FreezeController],
  providers: [FreezeService],
  exports: [FreezeService],
})
export class FreezeModule {}
