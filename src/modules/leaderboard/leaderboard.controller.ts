import { Controller } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('contests/:contestId/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  // GET /contests/:contestId/leaderboard
  getPublic(_contestId: string): void {
    void this.leaderboardService;
  }

  // GET /contests/:contestId/leaderboard/live
  getLive(_contestId: string): void {
    void this.leaderboardService;
  }
}
