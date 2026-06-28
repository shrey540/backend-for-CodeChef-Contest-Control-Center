import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ContestModule } from '../contest/contest.module';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  imports: [AuthModule, ContestModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
