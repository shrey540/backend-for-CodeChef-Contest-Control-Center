import { Controller } from '@nestjs/common';
import { RejudgeService } from './rejudge.service';

@Controller('contests/:contestId/submissions/:submissionId')
export class RejudgeController {
  constructor(private readonly rejudgeService: RejudgeService) {}

  // POST /contests/:contestId/submissions/:submissionId/rejudge
  rejudge(_contestId: string, _submissionId: string): void {
    void this.rejudgeService;
  }

  // GET  /contests/:contestId/submissions/:submissionId/rejudge-history
  getHistory(_contestId: string, _submissionId: string): void {
    void this.rejudgeService;
  }
}
