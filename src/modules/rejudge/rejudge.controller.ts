import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { RejudgeService } from './rejudge.service';
import { RejudgeHistoryResponseDto } from './dto/rejudge-history-response.dto';

@ApiTags('Rejudge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@ApiForbiddenResponse({ description: 'Participants cannot trigger rejudge.' })
@Controller('contests/:contestId/submissions/:submissionId')
export class RejudgeController {
  constructor(private readonly rejudgeService: RejudgeService) {}

  // ---------------------------------------------------------------------------
  // POST /contests/:contestId/submissions/:submissionId/rejudge
  // ---------------------------------------------------------------------------
  @Post('rejudge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Rejudge a submission. Stores old verdict, generates new verdict, ' +
      'and updates the submission atomically. Leaderboard recalculates ' +
      'automatically on the next GET.',
  })
  @ApiOkResponse({
    type: RejudgeHistoryResponseDto,
    description: 'Rejudge history entry with old and new verdicts.',
  })
  @ApiNotFoundResponse({ description: 'Contest or submission not found.' })
  @ApiForbiddenResponse({
    description: 'Not the contest owner or insufficient role.',
  })
  rejudge(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RejudgeHistoryResponseDto> {
    return this.rejudgeService.rejudge(contestId, submissionId, user);
  }
}
