import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
  ) {}

  // getPublicLeaderboard, getLiveLeaderboard
  // computeSolvedCount, computePenalty, rankEntries
}
