import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityAction } from '../../../common/enums/activity-action.enum';

export class ActivityLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ActivityAction })
  action: ActivityAction;

  @ApiPropertyOptional()
  contestId?: string | null;

  @ApiPropertyOptional()
  actorId?: string | null;

  @ApiPropertyOptional()
  entityType?: string | null;

  @ApiPropertyOptional()
  entityId?: string | null;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}
