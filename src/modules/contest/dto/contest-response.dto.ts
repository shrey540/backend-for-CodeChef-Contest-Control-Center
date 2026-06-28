import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContestStatus } from '@prisma/client';

export class ContestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizerId: string;

  @ApiProperty({ example: 'Summer Coding Challenge 2026' })
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty({ enum: ContestStatus })
  status: ContestStatus;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  freezeEnabled: boolean;

  @ApiPropertyOptional()
  freezeAt?: Date | null;

  @ApiPropertyOptional()
  startedAt?: Date | null;

  @ApiPropertyOptional()
  endedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
