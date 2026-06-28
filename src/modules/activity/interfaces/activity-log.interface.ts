import { ActivityAction } from '../../../common/enums/activity-action.enum';

export interface ActivityLogInput {
  action: ActivityAction;
  contestId?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}
