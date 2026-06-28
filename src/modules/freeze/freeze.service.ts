import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ContestStatus } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';

export interface FreezeStatusDto {
  contestId: string;
  freezeEnabled: boolean;
  freezeAt: Date | null;
}

@Injectable()
export class FreezeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
  ) {}

  /**
   * Enable freeze on a LIVE contest.
   * Sets freezeEnabled = true. If freezeAt was not pre-configured, defaults to now().
   * ADMIN or ORGANIZER (contest owner) only.
   */
  async enableFreeze(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<FreezeStatusDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.contestService.assertCanManage(contest, user);

    if (contest.status !== ContestStatus.LIVE) {
      throw new ForbiddenException(
        'Freeze can only be enabled while the contest is LIVE.',
      );
    }

    const updated = await this.prisma.contest.update({
      where: { id: contestId },
      data: {
        freezeEnabled: true,
        // Use existing freezeAt if already set; otherwise capture current time.
        freezeAt: contest.freezeAt ?? new Date(),
      },
    });

    return {
      contestId: updated.id,
      freezeEnabled: updated.freezeEnabled,
      freezeAt: updated.freezeAt,
    };
  }

  /**
   * Disable freeze, revealing the full live leaderboard.
   * Can be called regardless of contest status.
   * ADMIN or ORGANIZER (contest owner) only.
   */
  async disableFreeze(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<FreezeStatusDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.contestService.assertCanManage(contest, user);

    const updated = await this.prisma.contest.update({
      where: { id: contestId },
      data: { freezeEnabled: false },
    });

    return {
      contestId: updated.id,
      freezeEnabled: updated.freezeEnabled,
      freezeAt: updated.freezeAt,
    };
  }
}
