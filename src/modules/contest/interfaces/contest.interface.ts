import { ContestStatus } from '../../../common/enums/contest-status.enum';

export interface ContestVisibilityContext {
  userId: string;
  role: string;
}

export interface ContestStatusCheckResult {
  contestId: string;
  status: ContestStatus;
  endTime: Date;
  freezeEnabled: boolean;
  freezeAt: Date | null;
}
