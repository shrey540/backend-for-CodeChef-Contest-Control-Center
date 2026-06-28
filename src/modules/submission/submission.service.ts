import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContestStatus,
  ProgrammingLanguage,
  Submission,
  SubmissionVerdict,
  UserRole,
} from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmissionListQueryDto } from './dto/submission-list-query.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
  ) {}

  // ---------------------------------------------------------------------------
  // POST — Create a submission
  // ---------------------------------------------------------------------------

  async create(
    contestId: string,
    dto: CreateSubmissionDto,
    user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    if (contest.status === ContestStatus.ENDED) {
      throw new ForbiddenException('Contest has already ended.');
    }

    // Participants must be registered; ADMINs bypass registration check.
    if (user.role === UserRole.PARTICIPANT) {
      const registration = await this.prisma.registration.findFirst({
        where: { contestId, userId: user.id },
      });
      if (!registration) {
        throw new ForbiddenException(
          'Participant is not registered for this contest.',
        );
      }
    }

    const problem = await this.prisma.problem.findFirst({
      where: { id: dto.problemId, contestId },
    });
    if (!problem) {
      throw new NotFoundException('Problem not found.');
    }

    const submission = await this.prisma.submission.create({
      data: {
        contestId,
        problemId: dto.problemId,
        userId: user.id,
        language: dto.language as ProgrammingLanguage,
        code: dto.code,
        verdict: SubmissionVerdict.PENDING,
        judgedAt: null,
      },
    });

    return this.toResponse(submission);
  }

  // ---------------------------------------------------------------------------
  // GET — All submissions for a contest (ADMIN / ORGANIZER only)
  // ---------------------------------------------------------------------------

  async findAll(
    contestId: string,
    user: AuthenticatedUser,
    query: SubmissionListQueryDto = {},
  ): Promise<SubmissionResponseDto[]> {
    const contest = await this.contestService.findContestOrThrow(contestId);
    this.assertCanManageContest(contest, user);

    const { page = 1, limit = 20, participantId, problemId, verdict } = query;

    const submissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        ...(participantId && { userId: participantId }),
        ...(problemId && { problemId }),
        ...(verdict && { verdict }),
      },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return submissions.map((s) => this.toResponse(s));
  }

  // ---------------------------------------------------------------------------
  // GET — Single submission by ID
  // ---------------------------------------------------------------------------

  async findOne(
    contestId: string,
    submissionId: string,
    user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto> {
    await this.contestService.findContestOrThrow(contestId);

    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, contestId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    this.assertCanViewSubmission(submission, user);

    return this.toResponse(submission);
  }

  // ---------------------------------------------------------------------------
  // GET — All submissions by a specific participant
  // ---------------------------------------------------------------------------

  async findByParticipant(
    contestId: string,
    participantId: string,
    user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto[]> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    if (user.role === UserRole.PARTICIPANT && user.id !== participantId) {
      throw new ForbiddenException(
        'You are not allowed to view these submissions.',
      );
    }

    if (user.role === UserRole.ORGANIZER && contest.organizerId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to view these submissions.',
      );
    }

    const submissions = await this.prisma.submission.findMany({
      where: { contestId, userId: participantId },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions.map((s) => this.toResponse(s));
  }

  // ---------------------------------------------------------------------------
  // GET — All submissions for a specific problem
  // ---------------------------------------------------------------------------

  async findByProblem(
    contestId: string,
    problemId: string,
    user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto[]> {
    const contest = await this.contestService.findContestOrThrow(contestId);

    const problem = await this.prisma.problem.findFirst({
      where: { id: problemId, contestId },
    });
    if (!problem) {
      throw new NotFoundException('Problem not found.');
    }

    // Organizer must own the contest; participant sees only their own.
    if (user.role === UserRole.ORGANIZER && contest.organizerId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to view these submissions.',
      );
    }

    const where =
      user.role === UserRole.PARTICIPANT
        ? { contestId, problemId, userId: user.id }
        : { contestId, problemId };

    const submissions = await this.prisma.submission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });

    return submissions.map((s) => this.toResponse(s));
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * ADMIN: always passes.
   * ORGANIZER: must own the contest.
   * PARTICIPANT: never passes (caller must guard with RolesGuard).
   */
  private assertCanManageContest(
    contest: { organizerId: string },
    user: AuthenticatedUser,
  ): void {
    if (user.role === UserRole.ADMIN) return;

    if (user.role === UserRole.ORGANIZER && contest.organizerId === user.id) return;

    throw new ForbiddenException(
      'You are not allowed to view these submissions.',
    );
  }

  /**
   * For GET /submissions/:id — participants can only see their own submissions.
   */
  private assertCanViewSubmission(
    submission: { userId: string; contestId: string },
    user: AuthenticatedUser,
  ): void {
    if (user.role === UserRole.ADMIN) return;

    if (user.role === UserRole.PARTICIPANT && submission.userId === user.id) return;

    if (user.role === UserRole.PARTICIPANT) {
      throw new ForbiddenException(
        'You are not allowed to view these submissions.',
      );
    }
  }

  private toResponse(submission: Submission): SubmissionResponseDto {
    return {
      id: submission.id,
      contestId: submission.contestId,
      problemId: submission.problemId,
      userId: submission.userId,
      language: submission.language,
      code: submission.code,
      verdict: submission.verdict,
      submittedAt: submission.submittedAt,
      judgedAt: submission.judgedAt,
    };
  }
}
