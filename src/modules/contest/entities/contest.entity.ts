import { ContestStatus } from '../../../common/enums/contest-status.enum';

export interface ContestEntity {
  id: string;
  organizerId: string;
  name: string;
  description: string | null;
  status: ContestStatus;
  startTime: Date;
  endTime: Date;
  freezeEnabled: boolean;
  freezeAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
