import { SubmissionVerdict } from '../../../common/enums/submission-verdict.enum';

export interface MockJudgeInput {
  code: string;
  language: string;
  timeLimitMs: number;
  memoryLimitMb: number;
}

export interface MockJudgeResult {
  verdict: SubmissionVerdict;
}
