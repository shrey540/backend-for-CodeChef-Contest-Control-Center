import { ProblemDifficulty } from '../../../common/enums/problem-difficulty.enum';

export interface ProblemEntity {
  id: string;
  contestId: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  points: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  createdAt: Date;
  updatedAt: Date;
}
