import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { RegistrationService } from '../registration/registration.service';
import { ProblemService } from '../problem/problem.service';
import { MockJudgeService } from './services/mock-judge.service';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
    private readonly registrationService: RegistrationService,
    private readonly problemService: ProblemService,
    private readonly mockJudgeService: MockJudgeService,
  ) {}

  // create, findOne, findMine, findAll
}
