import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContestStatus, Prisma, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../../common/enums/activity-action.enum';
import { RegistrationResponseDto } from './dto/registration-response.dto';

/** Contest statuses that accept new registrations. */
const REGISTRATION_OPEN_STATUSES: ContestStatus[] = [
  ContestStatus.DRAFT,
  ContestStatus.SCHEDULED,
];

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Register the calling user for a contest.
   * Allowed roles: PARTICIPANT, ADMIN.
   * Registration window: DRAFT or SCHEDULED only.
   */
  async register(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    if (!REGISTRATION_OPEN_STATUSES.includes(contest.status)) {
      throw new ForbiddenException(
        'Registration is closed because the contest is already live or ended.',
      );
    }

    try {
      const registration = await this.prisma.registration.create({
        data: {
          contestId,
          userId: user.id,
        },
      });
      void this.activityService.log({
        action: ActivityAction.PARTICIPANT_REGISTERED,
        contestId,
        actorId: user.id,
        entityType: 'registration',
        entityId: registration.id,
      });
      return this.toResponse(registration);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Participant is already registered for this contest.',
        );
      }
      throw err;
    }
  }

  /**
   * List all registrations for a contest.
   * Allowed roles: ADMIN, ORGANIZER (own contest only).
   */
  async findAll(
    contestId: string,
    user: AuthenticatedUser,
  ): Promise<RegistrationResponseDto[]> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.assertCanViewRegistrations(contest, user);

    const registrations = await this.prisma.registration.findMany({
      where: { contestId },
      orderBy: { registeredAt: 'asc' },
    });

    return registrations.map((r) => this.toResponse(r));
  }

  /**
   * Get a single registration by the participant's user ID.
   * ADMIN: any.
   * ORGANIZER: own contest only.
   * PARTICIPANT: only their own registration.
   */
  async findOne(
    contestId: string,
    participantId: string,
    user: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    if (user.role === UserRole.PARTICIPANT && user.id !== participantId) {
      throw new ForbiddenException('You can only view your own registration.');
    }

    if (user.role === UserRole.ORGANIZER && contest.organizerId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to view registrations for this contest.',
      );
    }

    const registration = await this.prisma.registration.findFirst({
      where: { contestId, userId: participantId },
    });

    if (!registration) {
      throw new NotFoundException(
        `No registration found for participant "${participantId}" in this contest.`,
      );
    }

    return this.toResponse(registration);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private assertCanViewRegistrations(
    contest: { organizerId: string },
    user: AuthenticatedUser,
  ): void {
    if (user.role === UserRole.ADMIN) return;

    if (user.role === UserRole.ORGANIZER && contest.organizerId === user.id) return;

    throw new ForbiddenException(
      'You do not have permission to view registrations for this contest.',
    );
  }

  private toResponse(registration: {
    id: string;
    contestId: string;
    userId: string;
    registeredAt: Date;
  }): RegistrationResponseDto {
    return {
      id: registration.id,
      contestId: registration.contestId,
      userId: registration.userId,
      registeredAt: registration.registeredAt,
    };
  }
}
