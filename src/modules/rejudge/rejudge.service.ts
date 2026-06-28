import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { SubmissionService } from '../submission/submission.service';

@Injectable()
export class RejudgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
    private readonly submissionService: SubmissionService,
  ) {}

  // rejudge, getHistory
}
