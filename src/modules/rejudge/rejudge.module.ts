import { Module } from '@nestjs/common';
import { ContestModule } from '../contest/contest.module';
import { SubmissionModule } from '../submission/submission.module';
import { RejudgeController } from './rejudge.controller';
import { RejudgeService } from './rejudge.service';

@Module({
  imports: [ContestModule, SubmissionModule],
  controllers: [RejudgeController],
  providers: [RejudgeService],
})
export class RejudgeModule {}
