import { Injectable, NotFoundException } from '@nestjs/common';
import { RejudgeHistory, SubmissionVerdict } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../../common/enums/activity-action.enum';
import { RejudgeHistoryResponseDto } from './dto/rejudge-history-response.dto';

/**
 * Mock judge: simulates a verdict for a submission.
 * In production this would call a real judge queue / sandbox.
 *
 * The verdict is deterministic per submission ID so the same submission
 * always yields the same result across rejudge calls.
 */
function mockJudge(submissionId: string): SubmissionVerdict {
  const verdicts: SubmissionVerdict[] = [
    SubmissionVerdict.ACCEPTED,
    SubmissionVerdict.WRONG_ANSWER,
    SubmissionVerdict.RUNTIME_ERROR,
    SubmissionVerdict.TIME_LIMIT_EXCEEDED,
  ];
  // Use the second-to-last hex character of the UUID as a stable index.
  const hex = submissionId.replace(/-/g, '');
  const idx = parseInt(hex.charAt(hex.length - 2), 16) % verdicts.length;
  return verdicts[idx];
}

@Injectable()
export class RejudgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Rejudge a submission:
   *  1. Validate contest + ownership.
   *  2. Find submission (must belong to the contest).
   *  3. Generate new verdict via mock judge.
   *  4. Atomically: create RejudgeHistory row + update submission verdict.
   *  5. Log SUBMISSION_REJUDGED activity.
   *
   * Leaderboard recalculates automatically on the next GET because it is
   * computed dynamically from the Submission table.
   */
  async rejudge(
    contestId: string,
    submissionId: string,
    user: AuthenticatedUser,
  ): Promise<RejudgeHistoryResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.contestService.assertCanManage(contest, user);

    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, contestId },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with id "${submissionId}" not found in this contest.`,
      );
    }

    const oldVerdict = submission.verdict;
    const newVerdict = mockJudge(submissionId);

    // Atomic: record history + update verdict in one transaction.
    const [history] = await this.prisma.$transaction([
      this.prisma.rejudgeHistory.create({
        data: {
          submissionId,
          rejudgedById: user.id,
          oldVerdict,
          newVerdict,
        },
      }),
      this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          verdict: newVerdict,
          judgedAt: new Date(),
        },
      }),
    ]);

    // Fire-and-forget activity log.
    void this.activityService.log({
      action: ActivityAction.SUBMISSION_REJUDGED,
      contestId,
      actorId: user.id,
      entityType: 'submission',
      entityId: submissionId,
      metadata: { oldVerdict, newVerdict },
    });

    return this.toResponse(history);
  }

  private toResponse(history: RejudgeHistory): RejudgeHistoryResponseDto {
    return {
      id: history.id,
      submissionId: history.submissionId,
      rejudgedById: history.rejudgedById,
      oldVerdict: history.oldVerdict,
      newVerdict: history.newVerdict,
      rejudgedAt: history.rejudgedAt,
    };
  }
}
