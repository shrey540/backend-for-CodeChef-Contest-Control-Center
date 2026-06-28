import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgrammingLanguage } from '../../../common/enums/programming-language.enum';
import { SubmissionVerdict } from '../../../common/enums/submission-verdict.enum';

export class SubmissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contestId: string;

  @ApiProperty()
  problemId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ProgrammingLanguage })
  language: ProgrammingLanguage;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: SubmissionVerdict })
  verdict: SubmissionVerdict;

  @ApiProperty()
  submittedAt: Date;

  @ApiPropertyOptional()
  judgedAt?: Date | null;
}
