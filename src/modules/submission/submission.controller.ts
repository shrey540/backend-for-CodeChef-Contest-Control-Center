import { Controller } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto, SubmissionListQueryDto } from './dto';

@Controller('contests/:contestId/submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  // POST /contests/:contestId/submissions
  create(_contestId: string, _dto: CreateSubmissionDto): void {
    void this.submissionService;
  }

  // GET  /contests/:contestId/submissions/:submissionId
  findOne(_contestId: string, _submissionId: string): void {
    void this.submissionService;
  }

  // GET  /contests/:contestId/submissions/me
  findMine(_contestId: string, _query: SubmissionListQueryDto): void {
    void this.submissionService;
  }

  // GET  /contests/:contestId/submissions
  findAll(_contestId: string, _query: SubmissionListQueryDto): void {
    void this.submissionService;
  }
}
