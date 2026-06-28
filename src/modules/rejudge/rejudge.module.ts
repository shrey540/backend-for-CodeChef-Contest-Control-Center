import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ContestModule } from '../contest/contest.module';
import { RejudgeController } from './rejudge.controller';
import { RejudgeService } from './rejudge.service';

@Module({
  imports: [AuthModule, ContestModule],
  controllers: [RejudgeController],
  providers: [RejudgeService],
  exports: [RejudgeService],
})
export class RejudgeModule {}
