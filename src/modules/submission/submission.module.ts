import { Module } from '@nestjs/common';
import { ContestModule } from '../contest/contest.module';
import { RegistrationModule } from '../registration/registration.module';
import { ProblemModule } from '../problem/problem.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { MockJudgeService } from './services/mock-judge.service';

@Module({
  imports: [ContestModule, RegistrationModule, ProblemModule],
  controllers: [SubmissionController],
  providers: [SubmissionService, MockJudgeService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
