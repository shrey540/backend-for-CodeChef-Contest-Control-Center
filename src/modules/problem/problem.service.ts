import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContestStatus, Prisma, Problem, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../../common/enums/activity-action.enum';
import { CreateProblemDto } from './dto/create-problem.dto';
import { ProblemResponseDto } from './dto/problem-response.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
    private readonly activityService: ActivityService,
  ) {}

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  async create(
    contestId: string,
    dto: CreateProblemDto,
    user: AuthenticatedUser,
  ): Promise<ProblemResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.contestService.assertCanManage(contest, user);
    this.assertContestEditable(contest);

    try {
      const problem = await this.prisma.problem.create({
        data: {
          contestId,
          code: dto.code,
          title: dto.title,
          statement: dto.statement,
          difficulty: dto.difficulty,
          points: dto.points,
          timeLimitMs: dto.timeLimitMs ?? 2000,
          memoryLimitMb: dto.memoryLimitMb ?? 256,
        },
      });
      void this.activityService.log({
        action: ActivityAction.PROBLEM_CREATED,
        contestId,
        actorId: user.id,
        entityType: 'problem',
        entityId: problem.id,
      });
      return this.toResponse(problem);
    } catch (err) {
      this.handlePrismaError(err, dto.code, dto.title);
    }
  }

  async update(
    contestId: string,
    id: string,
    dto: UpdateProblemDto,
    user: AuthenticatedUser,
  ): Promise<ProblemResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.contestService.assertCanManage(contest, user);
    this.assertContestEditable(contest);

    await this.findProblemOrThrow(id, contestId);

    try {
      const updated = await this.prisma.problem.update({
        where: { id },
        data: {
          ...(dto.code !== undefined && { code: dto.code }),
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.statement !== undefined && { statement: dto.statement }),
          ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
          ...(dto.points !== undefined && { points: dto.points }),
          ...(dto.timeLimitMs !== undefined && { timeLimitMs: dto.timeLimitMs }),
          ...(dto.memoryLimitMb !== undefined && { memoryLimitMb: dto.memoryLimitMb }),
        },
      });
      void this.activityService.log({
        action: ActivityAction.PROBLEM_UPDATED,
        contestId,
        actorId: user.id,
        entityType: 'problem',
        entityId: updated.id,
      });
      return this.toResponse(updated);
    } catch (err) {
      this.handlePrismaError(err, dto.code, dto.title);
    }
  }

  async remove(
    contestId: string,
    id: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.contestService.assertCanManage(contest, user);
    this.assertContestEditable(contest);

    await this.findProblemOrThrow(id, contestId);

    try {
      await this.prisma.problem.delete({ where: { id } });
      void this.activityService.log({
        action: ActivityAction.PROBLEM_DELETED,
        contestId,
        actorId: user.id,
        entityType: 'problem',
        entityId: id,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cannot delete this problem: submissions exist for it.',
        );
      }
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  async findAll(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<ProblemResponseDto[]> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.assertContestVisibleToUser(contest, user);

    const problems = await this.prisma.problem.findMany({
      where: { contestId },
      orderBy: [{ code: 'asc' }, { createdAt: 'asc' }],
    });

    return problems.map((p) => this.toResponse(p));
  }

  async findOne(
    contestId: string,
    id: string,
    user: AuthenticatedUser,
  ): Promise<ProblemResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.assertContestVisibleToUser(contest, user);

    const problem = await this.findProblemOrThrow(id, contestId);
    return this.toResponse(problem);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async findProblemOrThrow(id: string, contestId: string): Promise<Problem> {
    const problem = await this.prisma.problem.findFirst({
      where: { id, contestId },
    });

    if (!problem) {
      throw new NotFoundException(
        `Problem with id "${id}" not found in contest "${contestId}".`,
      );
    }

    return problem;
  }

  /**
   * ADMIN: sees all.
   * ORGANIZER: sees their own contests (any status) + non-DRAFT others.
   * PARTICIPANT: sees only non-DRAFT contests.
   */
  private assertContestVisibleToUser(
    contest: { id: string; status: ContestStatus; organizerId: string },
    user: AuthenticatedUser,
  ): void {
    if (user.role === UserRole.ADMIN) return;

    if (user.role === UserRole.ORGANIZER && contest.organizerId === user.id) return;

    if (contest.status === ContestStatus.DRAFT) {
      throw new NotFoundException(`Contest with id "${contest.id}" not found.`);
    }
  }

  /**
   * Problems in an ENDED contest are read-only.
   * DRAFT and LIVE contests allow full problem management.
   */
  private assertContestEditable(contest: { status: ContestStatus }): void {
    if (contest.status === ContestStatus.ENDED) {
      throw new ForbiddenException(
        'Cannot modify problems of a contest that has already ended.',
      );
    }
  }

  /**
   * Maps Prisma P2002 (unique violation) and P2003 (FK violation) to HTTP 409.
   * Always throws — declared as `never` so TypeScript knows no return is possible.
   */
  private handlePrismaError(err: unknown, code?: string, title?: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const target = (err.meta?.target as string[] | undefined) ?? [];
        if (target.includes('code') && code) {
          throw new ConflictException(
            `A problem with code "${code}" already exists in this contest.`,
          );
        }
        if (target.includes('title') && title) {
          throw new ConflictException(
            `A problem with title "${title}" already exists in this contest.`,
          );
        }
        throw new ConflictException('Duplicate value violates a unique constraint.');
      }
    }
    throw err;
  }

  private toResponse(problem: Problem): ProblemResponseDto {
    return {
      id: problem.id,
      contestId: problem.contestId,
      code: problem.code,
      title: problem.title,
      statement: problem.statement,
      difficulty: problem.difficulty,
      points: problem.points,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
    };
  }
}
