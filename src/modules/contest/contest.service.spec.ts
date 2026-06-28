import { ConflictException } from '@nestjs/common';
import { Contest, ContestStatus, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from './contest.service';

describe('ContestService lifecycle', () => {
  let service: ContestService;
  let prisma: {
    contest: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const organizer: AuthenticatedUser = {
    id: 'organizer-1',
    email: 'organizer@codechef.local',
    role: UserRole.ORGANIZER,
  };

  const baseContest: Contest = {
    id: 'contest-1',
    organizerId: organizer.id,
    name: 'Test Contest',
    description: null,
    status: ContestStatus.DRAFT,
    startTime: new Date('2026-07-01T10:00:00.000Z'),
    endTime: new Date('2026-07-01T11:30:00.000Z'),
    freezeEnabled: false,
    freezeAt: null,
    startedAt: null,
    endedAt: null,
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
    updatedAt: new Date('2026-06-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    prisma = {
      contest: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new ContestService(prisma as unknown as PrismaService);
  });

  describe('start', () => {
    it('returns 409 when contest is already LIVE', async () => {
      prisma.contest.findUnique.mockResolvedValue({
        ...baseContest,
        status: ContestStatus.LIVE,
        startedAt: new Date(),
      });

      await expect(service.start(baseContest.id, organizer)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.start(baseContest.id, organizer)).rejects.toThrow(
        'Contest is already live.',
      );
      expect(prisma.contest.update).not.toHaveBeenCalled();
    });

    it('returns 409 when contest is ENDED', async () => {
      prisma.contest.findUnique.mockResolvedValue({
        ...baseContest,
        status: ContestStatus.ENDED,
        endedAt: new Date(),
      });

      await expect(service.start(baseContest.id, organizer)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.start(baseContest.id, organizer)).rejects.toThrow(
        'Contest has already ended and cannot be restarted.',
      );
      expect(prisma.contest.update).not.toHaveBeenCalled();
    });

    it('transitions DRAFT to LIVE', async () => {
      prisma.contest.findUnique.mockResolvedValue(baseContest);
      prisma.contest.update.mockResolvedValue({
        ...baseContest,
        status: ContestStatus.LIVE,
        startedAt: new Date('2026-07-01T10:00:00.000Z'),
      });

      const result = await service.start(baseContest.id, organizer);

      expect(result.status).toBe(ContestStatus.LIVE);
      expect(prisma.contest.update).toHaveBeenCalledWith({
        where: { id: baseContest.id },
        data: {
          status: ContestStatus.LIVE,
          startedAt: expect.any(Date),
        },
      });
    });
  });

  describe('end', () => {
    it('returns 409 when contest is DRAFT', async () => {
      prisma.contest.findUnique.mockResolvedValue(baseContest);

      await expect(service.end(baseContest.id, organizer)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.end(baseContest.id, organizer)).rejects.toThrow(
        'Contest must be live to end.',
      );
      expect(prisma.contest.update).not.toHaveBeenCalled();
    });

    it('returns 409 when contest is already ENDED', async () => {
      prisma.contest.findUnique.mockResolvedValue({
        ...baseContest,
        status: ContestStatus.ENDED,
        endedAt: new Date(),
      });

      await expect(service.end(baseContest.id, organizer)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.end(baseContest.id, organizer)).rejects.toThrow(
        'Contest has already ended.',
      );
      expect(prisma.contest.update).not.toHaveBeenCalled();
    });

    it('transitions LIVE to ENDED', async () => {
      prisma.contest.findUnique.mockResolvedValue({
        ...baseContest,
        status: ContestStatus.LIVE,
        startedAt: new Date(),
      });
      prisma.contest.update.mockResolvedValue({
        ...baseContest,
        status: ContestStatus.ENDED,
        startedAt: new Date(),
        endedAt: new Date('2026-07-01T11:30:00.000Z'),
      });

      const result = await service.end(baseContest.id, organizer);

      expect(result.status).toBe(ContestStatus.ENDED);
      expect(prisma.contest.update).toHaveBeenCalledWith({
        where: { id: baseContest.id },
        data: {
          status: ContestStatus.ENDED,
          endedAt: expect.any(Date),
        },
      });
    });
  });
});
