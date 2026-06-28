import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityAction, ActivityLog, Prisma, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogListQueryDto } from './dto/activity-log-list-query.dto';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { ActivityLogInput } from './interfaces/activity-log.interface';

export type { ActivityLogInput };

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append an activity log entry.
   * Fire-and-forget: never throws so callers are never broken by a logging failure.
   */
  async log(input: ActivityLogInput): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          action: input.action as ActivityAction,
          contestId: input.contestId ?? null,
          actorId: input.actorId ?? null,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          ...(input.metadata && { metadata: input.metadata as Prisma.InputJsonValue }),
        },
      });
    } catch (err) {
      console.error('[ActivityService] Failed to log activity:', err);
    }
  }

  /**
   * List activity logs for a contest.
   * ADMIN: any contest. ORGANIZER: own contest only.
   * Supports optional filtering by action, date range, and pagination.
   */
  async findAll(
    contestId: string,
    user: AuthenticatedUser,
    query: ActivityLogListQueryDto,
  ): Promise<ActivityLogResponseDto[]> {
    await this.assertContestAccessible(contestId, user);

    const { page = 1, limit = 20, action, from, to } = query;

    const where: Prisma.ActivityLogWhereInput = {
      contestId,
      ...(action && { action: action as ActivityAction }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const logs = await this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return logs.map((l) => this.toResponse(l));
  }

  /**
   * Get a single activity log by ID, scoped to the contest.
   */
  async findOne(
    contestId: string,
    id: string,
    user: AuthenticatedUser,
  ): Promise<ActivityLogResponseDto> {
    await this.assertContestAccessible(contestId, user);

    const log = await this.prisma.activityLog.findFirst({
      where: { id, contestId },
    });

    if (!log) {
      throw new NotFoundException(`Activity log with id "${id}" not found.`);
    }

    return this.toResponse(log);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Verify the contest exists and the caller has permission to view its logs.
   * Uses PrismaService directly to avoid circular dependency with ContestModule.
   */
  private async assertContestAccessible(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      throw new NotFoundException('Contest not found.');
    }

    if (user.role === UserRole.ADMIN) return;

    if (user.role === UserRole.ORGANIZER && contest.organizerId === user.id) return;

    throw new ForbiddenException(
      'You do not have permission to view activity logs for this contest.',
    );
  }

  private toResponse(log: ActivityLog): ActivityLogResponseDto {
    return {
      id: log.id,
      action: log.action,
      contestId: log.contestId,
      actorId: log.actorId,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt,
    };
  }
}
