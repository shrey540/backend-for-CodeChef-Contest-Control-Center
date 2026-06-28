import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { ParticipantRankDto } from './dto/participant-rank.dto';

@ApiTags('Leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@Controller('contests/:contestId/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/leaderboard
  // ---------------------------------------------------------------------------
  @Get()
  @ApiOperation({
    summary: 'Get contest leaderboard. Freeze-aware: participants see snapshot when frozen.',
  })
  @ApiOkResponse({ type: LeaderboardResponseDto })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  getLeaderboard(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(contestId, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/leaderboard/rank/:participantId
  // ---------------------------------------------------------------------------
  @Get('rank/:participantId')
  @ApiOperation({
    summary: "Get a specific participant's rank within the contest leaderboard.",
  })
  @ApiOkResponse({ type: ParticipantRankDto })
  @ApiNotFoundResponse({ description: 'Contest not found or participant has no submissions.' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions.' })
  getParticipantRank(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('participantId', ParseUUIDPipe) participantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ParticipantRankDto> {
    return this.leaderboardService.getParticipantRank(contestId, participantId, user);
  }
}
