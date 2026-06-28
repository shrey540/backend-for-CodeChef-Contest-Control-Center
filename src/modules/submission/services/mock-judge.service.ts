import { SubmissionVerdict } from '../../../common/enums/submission-verdict.enum';
import { MockJudgeInput, MockJudgeResult } from '../interfaces/mock-judge.interface';

export class MockJudgeService {
  evaluate(_input: MockJudgeInput): MockJudgeResult {
    void SubmissionVerdict;
    return { verdict: SubmissionVerdict.PENDING };
  }
}
