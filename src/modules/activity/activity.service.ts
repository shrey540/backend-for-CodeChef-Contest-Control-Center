import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogInput } from './interfaces/activity-log.interface';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  // log (called by other modules), findByContest
}

export type { ActivityLogInput };
