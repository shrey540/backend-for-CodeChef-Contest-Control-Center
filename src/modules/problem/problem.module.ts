import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ContestModule } from '../contest/contest.module';
import { ProblemController } from './problem.controller';
import { ProblemService } from './problem.service';

@Module({
  imports: [AuthModule, ContestModule],
  controllers: [ProblemController],
  providers: [ProblemService],
  exports: [ProblemService],
})
export class ProblemModule {}
