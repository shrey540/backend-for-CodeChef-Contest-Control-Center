import { ApiProperty } from '@nestjs/swagger';
import { LeaderboardEntryDto } from './leaderboard-entry.dto';

export class ParticipantRankDto extends LeaderboardEntryDto {
  @ApiProperty({ description: 'Whether the leaderboard is currently frozen.' })
  isFrozen: boolean;
}
