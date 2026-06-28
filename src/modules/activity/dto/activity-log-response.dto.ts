import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityAction } from '@prisma/client';

export class ActivityLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ActivityAction })
  action: ActivityAction;

  @ApiPropertyOptional({ nullable: true })
  contestId: string | null;

  @ApiPropertyOptional({ nullable: true })
  actorId: string | null;

  @ApiPropertyOptional({ nullable: true })
  entityType: string | null;

  @ApiPropertyOptional({ nullable: true })
  entityId: string | null;

  @ApiPropertyOptional({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}
