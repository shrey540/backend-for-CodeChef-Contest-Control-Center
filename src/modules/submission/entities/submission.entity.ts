import { ProgrammingLanguage } from '../../../common/enums/programming-language.enum';
import { SubmissionVerdict } from '../../../common/enums/submission-verdict.enum';

export interface SubmissionEntity {
  id: string;
  contestId: string;
  problemId: string;
  userId: string;
  language: ProgrammingLanguage;
  code: string;
  verdict: SubmissionVerdict;
  submittedAt: Date;
  judgedAt: Date | null;
}
