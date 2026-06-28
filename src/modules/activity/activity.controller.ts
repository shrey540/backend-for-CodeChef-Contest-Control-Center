import { Controller } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityLogListQueryDto } from './dto';

@Controller('contests/:contestId/activity-logs')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // GET /contests/:contestId/activity-logs
  findAll(_contestId: string, _query: ActivityLogListQueryDto): void {
    void this.activityService;
  }
}
