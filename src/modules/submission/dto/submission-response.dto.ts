import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgrammingLanguage, SubmissionVerdict } from '@prisma/client';

export class SubmissionResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
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

  @ApiPropertyOptional({ nullable: true })
  judgedAt: Date | null;
}
