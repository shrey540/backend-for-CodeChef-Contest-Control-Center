import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';

@Module({
  imports: [AuthModule],
  controllers: [ContestController],
  providers: [ContestService],
  exports: [ContestService],
})
export class ContestModule {}
