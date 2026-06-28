import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaderboardEntryDto } from './leaderboard-entry.dto';

export class LeaderboardMetaDto {
  @ApiProperty()
  contestId: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiPropertyOptional()
  freezeAt?: Date | null;

  @ApiProperty()
  generatedAt: Date;
}

export class LeaderboardResponseDto {
  @ApiProperty({ type: [LeaderboardEntryDto] })
  data: LeaderboardEntryDto[];

  @ApiProperty({ type: LeaderboardMetaDto })
  meta: LeaderboardMetaDto;
}
