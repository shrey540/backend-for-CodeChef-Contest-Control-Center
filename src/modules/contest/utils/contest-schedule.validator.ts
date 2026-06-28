import { BadRequestException } from '@nestjs/common';

export function validateContestSchedule(
  startTime: Date,
  endTime: Date,
  freezeAt?: Date | null,
): void {
  if (startTime >= endTime) {
    throw new BadRequestException('startTime must be before endTime');
  }

  if (freezeAt && (freezeAt < startTime || freezeAt > endTime)) {
    throw new BadRequestException('freezeAt must be between startTime and endTime');
  }
}
