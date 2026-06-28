import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContestModule } from './modules/contest/contest.module';
import { ProblemModule } from './modules/problem/problem.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SubmissionModule } from './modules/submission/submission.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { FreezeModule } from './modules/freeze/freeze.module';
import { RejudgeModule } from './modules/rejudge/rejudge.module';
import { ActivityModule } from './modules/activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppConfigModule,
    PrismaModule,
    AuthModule,
    ContestModule,
    ProblemModule,
    RegistrationModule,
    SubmissionModule,
    LeaderboardModule,
    FreezeModule,
    RejudgeModule,
    ActivityModule,
  ],
})
export class AppModule {}
