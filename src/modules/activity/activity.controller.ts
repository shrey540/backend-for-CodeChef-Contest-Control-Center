import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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
import { ActivityService } from './activity.service';
import { ActivityLogListQueryDto } from './dto/activity-log-list-query.dto';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@ApiForbiddenResponse({ description: 'Participants cannot view activity logs.' })
@Controller('contests/:contestId/activity-logs')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/activity-logs
  // ---------------------------------------------------------------------------
  @Get()
  @ApiOperation({
    summary:
      'List activity logs for a contest. ADMIN: any contest. ORGANIZER: own contest only.',
  })
  @ApiOkResponse({ type: [ActivityLogResponseDto] })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  findAll(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Query() query: ActivityLogListQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityLogResponseDto[]> {
    return this.activityService.findAll(contestId, user, query);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/activity-logs/:id
  // ---------------------------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get a single activity log entry by ID.' })
  @ApiOkResponse({ type: ActivityLogResponseDto })
  @ApiNotFoundResponse({ description: 'Contest or activity log not found.' })
  findOne(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityLogResponseDto> {
    return this.activityService.findOne(contestId, id, user);
  }
}
