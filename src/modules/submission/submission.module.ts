import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ContestModule } from '../contest/contest.module';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';

@Module({
  imports: [AuthModule, ContestModule],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
