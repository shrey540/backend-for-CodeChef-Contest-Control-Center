import { Injectable, NotFoundException } from '@nestjs/common';
import { ContestStatus, SubmissionVerdict, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import { LeaderboardMetaDto, LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { ParticipantRankDto } from './dto/participant-rank.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
  ) {}

  /**
   * Full leaderboard for a contest.
   * - ADMIN / ORGANIZER (owner): always sees unfrozen data.
   * - Everyone else: sees frozen snapshot when freeze is active.
   */
  async getLeaderboard(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<LeaderboardResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    const showFull = this.canSeeLiveData(contest, user);
    const cutoffTime =
      !showFull && contest.freezeEnabled && contest.freezeAt
        ? contest.freezeAt
        : undefined;

    const entries = await this.computeRankedEntries(contest, cutoffTime);

    const meta: LeaderboardMetaDto = {
      contestId: contest.id,
      isFrozen: !showFull && contest.freezeEnabled && !!contest.freezeAt,
      freezeAt: contest.freezeAt,
      generatedAt: new Date(),
    };

    return { data: entries, meta };
  }

  /**
   * Single participant's rank within the leaderboard.
   * Applies the same freeze logic as getLeaderboard.
   */
  async getParticipantRank(
    contestId: string,
    participantId: string,
    user: AuthenticatedUser,
  ): Promise<ParticipantRankDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    const showFull = this.canSeeLiveData(contest, user);
    const cutoffTime =
      !showFull && contest.freezeEnabled && contest.freezeAt
        ? contest.freezeAt
        : undefined;

    const entries = await this.computeRankedEntries(contest, cutoffTime);

    const entry = entries.find((e) => e.userId === participantId);
    if (!entry) {
      throw new NotFoundException(
        `No leaderboard entry found for participant "${participantId}".`,
      );
    }

    return {
      ...entry,
      isFrozen: !showFull && contest.freezeEnabled && !!contest.freezeAt,
    };
  }

  // ---------------------------------------------------------------------------
  // Core computation
  // ---------------------------------------------------------------------------

  /**
   * Fetches all relevant submissions and computes ranked entries using the
   * standard ICPC penalty formula:
   *   penalty = Σ (minutesFromStart(firstAC) + wrongAttemptsBefore × 20)
   *
   * Submissions are filtered to before cutoffTime when the leaderboard is frozen.
   */
  private async computeRankedEntries(
    contest: {
      id: string;
      startedAt: Date | null;
      startTime: Date;
      status: ContestStatus;
    },
    cutoffTime?: Date,
  ): Promise<LeaderboardEntryDto[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        contestId: contest.id,
        ...(cutoffTime && { submittedAt: { lt: cutoffTime } }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // clock origin — prefer the actual start timestamp, fall back to scheduled startTime
    const clockOrigin = contest.startedAt ?? contest.startTime;

    // group submissions by userId → problemId
    type UserBucket = {
      user: { id: string; name: string; email: string };
      byProblem: Map<string, typeof submissions>;
    };

    const byUser = new Map<string, UserBucket>();

    for (const sub of submissions) {
      if (!byUser.has(sub.userId)) {
        byUser.set(sub.userId, {
          user: sub.user,
          byProblem: new Map(),
        });
      }
      const bucket = byUser.get(sub.userId)!;
      if (!bucket.byProblem.has(sub.problemId)) {
        bucket.byProblem.set(sub.problemId, []);
      }
      bucket.byProblem.get(sub.problemId)!.push(sub);
    }

    const entries: LeaderboardEntryDto[] = [];

    for (const [, { user, byProblem }] of byUser) {
      let solvedCount = 0;
      let penalty = 0;

      for (const [, subs] of byProblem) {
        const firstAc = subs.find((s) => s.verdict === SubmissionVerdict.ACCEPTED);
        if (!firstAc) continue;

        solvedCount++;

        const minutesFromStart = Math.floor(
          (firstAc.submittedAt.getTime() - clockOrigin.getTime()) / 60_000,
        );

        const wrongBefore = subs.filter(
          (s) =>
            s.submittedAt < firstAc.submittedAt &&
            s.verdict !== SubmissionVerdict.ACCEPTED &&
            s.verdict !== SubmissionVerdict.PENDING &&
            s.verdict !== SubmissionVerdict.RUNNING,
        ).length;

        penalty += Math.max(0, minutesFromStart) + wrongBefore * 20;
      }

      entries.push({
        rank: 0,
        userId: user.id,
        name: user.name,
        email: user.email,
        solvedCount,
        penalty,
      });
    }

    // rank: most solved first; fewest penalty minutes as tiebreaker
    entries.sort(
      (a, b) => b.solvedCount - a.solvedCount || a.penalty - b.penalty,
    );
    entries.forEach((e, i) => {
      e.rank = i + 1;
    });

    return entries;
  }

  /**
   * Returns true when the requesting user should see the full (unfrozen) data.
   * ADMIN always sees full. ORGANIZER sees full for their own contests.
   */
  private canSeeLiveData(
    contest: { organizerId: string },
    user: AuthenticatedUser,
  ): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.ORGANIZER && contest.organizerId === user.id) return true;
    return false;
  }
}
