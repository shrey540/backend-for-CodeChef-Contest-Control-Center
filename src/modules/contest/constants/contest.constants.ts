import { ContestStatus } from '@prisma/client';

export const PARTICIPANT_VISIBLE_STATUSES: ContestStatus[] = [
  ContestStatus.LIVE,
  ContestStatus.ENDED,
];