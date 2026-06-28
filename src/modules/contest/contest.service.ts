import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Contest, ContestStatus, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { PARTICIPANT_VISIBLE_STATUSES } from './constants/contest.constants';
import { CreateContestDto, ContestResponseDto, UpdateContestDto } from './dto';
import { validateContestSchedule } from './utils/contest-schedule.validator';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../../common/enums/activity-action.enum';

@Injectable()
export class ContestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async create(
    user: AuthenticatedUser,
    dto: CreateContestDto,
  ): Promise<ContestResponseDto> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const freezeAt = dto.freezeAt ? new Date(dto.freezeAt) : null;

    validateContestSchedule(startTime, endTime, freezeAt);

    const contest = await this.prisma.contest.create({
      data: {
        organizerId: user.id,
        name: dto.name,
        description: dto.description,
        status: ContestStatus.DRAFT,
        startTime,
        endTime,
        freezeEnabled: dto.freezeEnabled ?? false,
        freezeAt,
      },
    });

    void this.activityService.log({
      action: ActivityAction.CONTEST_CREATED,
      contestId: contest.id,
      actorId: user.id,
      entityType: 'contest',
      entityId: contest.id,
    });

    return this.toResponse(contest);
  }

  async findAll(user: AuthenticatedUser): Promise<ContestResponseDto[]> {
    const where = this.buildListWhereClause(user);

    const contests = await this.prisma.contest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return contests.map((contest) => this.toResponse(contest));
  }

  async findOne(id: string, user: AuthenticatedUser): Promise<ContestResponseDto> {
    const contest = await this.findContestOrThrow(id);
    this.assertReadable(contest, user);
    return this.toResponse(contest);
  }

  async update(
    id: string,
    user: AuthenticatedUser,
    dto: UpdateContestDto,
  ): Promise<ContestResponseDto> {
    const contest = await this.findContestOrThrow(id);
    this.assertCanManage(contest, user);

    if (contest.status === ContestStatus.ENDED) {
      throw new ConflictException('Cannot update an ended contest');
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : contest.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : contest.endTime;
    const freezeAt =
      dto.freezeAt !== undefined
        ? dto.freezeAt
          ? new Date(dto.freezeAt)
          : null
        : contest.freezeAt;

    validateContestSchedule(startTime, endTime, freezeAt);

    const updated = await this.prisma.contest.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        startTime: dto.startTime ? startTime : undefined,
        endTime: dto.endTime ? endTime : undefined,
        freezeEnabled: dto.freezeEnabled,
        freezeAt: dto.freezeAt !== undefined ? freezeAt : undefined,
      },
    });

    void this.activityService.log({
      action: ActivityAction.CONTEST_UPDATED,
      contestId: updated.id,
      actorId: user.id,
      entityType: 'contest',
      entityId: updated.id,
    });

    return this.toResponse(updated);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const contest = await this.findContestOrThrow(id);
    this.assertCanManage(contest, user);

    if (contest.status === ContestStatus.LIVE) {
      throw new ConflictException('Cannot delete a live contest');
    }

    if (contest.status === ContestStatus.ENDED) {
      throw new ConflictException('Cannot delete an ended contest');
    }

    try {
      await this.prisma.contest.delete({ where: { id } });
    } catch {
      throw new ConflictException(
        'Contest cannot be deleted because it has dependent records',
      );
    }
  }

  async start(id: string, user: AuthenticatedUser): Promise<ContestResponseDto> {
    const contest = await this.findContestOrThrow(id);
    this.assertCanManage(contest, user);
    this.assertCanStart(contest);

    const updated = await this.prisma.contest.update({
      where: { id },
      data: {
        status: ContestStatus.LIVE,
        startedAt: new Date(),
      },
    });

    void this.activityService.log({
      action: ActivityAction.CONTEST_STARTED,
      contestId: updated.id,
      actorId: user.id,
      entityType: 'contest',
      entityId: updated.id,
    });

    return this.toResponse(updated);
  }

  async end(id: string, user: AuthenticatedUser): Promise<ContestResponseDto> {
    const contest = await this.findContestOrThrow(id);
    this.assertCanManage(contest, user);
    this.assertCanEnd(contest);

    const updated = await this.prisma.contest.update({
      where: { id },
      data: {
        status: ContestStatus.ENDED,
        endedAt: new Date(),
      },
    });

    void this.activityService.log({
      action: ActivityAction.CONTEST_ENDED,
      contestId: updated.id,
      actorId: user.id,
      entityType: 'contest',
      entityId: updated.id,
    });

    return this.toResponse(updated);
  }

  assertCanStart(contest: Contest): void {
    if (contest.status === ContestStatus.LIVE) {
      throw new ConflictException('Contest is already live.');
    }

    if (contest.status === ContestStatus.ENDED) {
      throw new ConflictException(
        'Contest has already ended and cannot be restarted.',
      );
    }

    if (contest.status !== ContestStatus.DRAFT) {
      throw new ConflictException('Contest can only be started from DRAFT status.');
    }
  }

  assertCanEnd(contest: Contest): void {
    if (contest.status === ContestStatus.ENDED) {
      throw new ConflictException('Contest has already ended.');
    }

    if (contest.status !== ContestStatus.LIVE) {
      throw new ConflictException('Contest must be live to end.');
    }
  }

  async findContestOrThrow(id: string): Promise<Contest> {
    const contest = await this.prisma.contest.findUnique({ where: { id } });

    if (!contest) {
      throw new NotFoundException(`Contest with id "${id}" not found`);
    }

    return contest;
  }

  assertCanManage(contest: Contest, user: AuthenticatedUser): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (user.role === UserRole.ORGANIZER && contest.organizerId === user.id) {
      return;
    }

    throw new ForbiddenException('You do not have permission to manage this contest');
  }

  private assertReadable(contest: Contest, user: AuthenticatedUser): void {
    if (user.role === UserRole.PARTICIPANT && contest.status === ContestStatus.DRAFT) {
      throw new NotFoundException(`Contest with id "${contest.id}" not found`);
    }

    if (
      user.role === UserRole.ORGANIZER &&
      contest.organizerId !== user.id &&
      contest.status === ContestStatus.DRAFT
    ) {
      throw new NotFoundException(`Contest with id "${contest.id}" not found`);
    }
  }

  private buildListWhereClause(user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN) {
      return {};
    }

    if (user.role === UserRole.ORGANIZER) {
      return { organizerId: user.id };
    }

    return {
      status: { in: PARTICIPANT_VISIBLE_STATUSES },
    };
  }

  private toResponse(contest: Contest): ContestResponseDto {
    return {
      id: contest.id,
      organizerId: contest.organizerId,
      name: contest.name,
      description: contest.description,
      status: contest.status,
      startTime: contest.startTime,
      endTime: contest.endTime,
      freezeEnabled: contest.freezeEnabled,
      freezeAt: contest.freezeAt,
      startedAt: contest.startedAt,
      endedAt: contest.endedAt,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
    };
  }
}
