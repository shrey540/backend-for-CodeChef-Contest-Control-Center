import { ApiProperty } from '@nestjs/swagger';
import { SubmissionVerdict } from '../../../common/enums/submission-verdict.enum';

export class RejudgeHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  submissionId: string;

  @ApiProperty()
  rejudgedById: string;

  @ApiProperty({ enum: SubmissionVerdict })
  oldVerdict: SubmissionVerdict;

  @ApiProperty({ enum: SubmissionVerdict })
  newVerdict: SubmissionVerdict;

  @ApiProperty()
  rejudgedAt: Date;
}
