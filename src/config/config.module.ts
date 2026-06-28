import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  exports: [ConfigModule],
})
export class AppConfigModule {}
