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
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { FreezeService, FreezeStatusDto } from './freeze.service';

class FreezeResponseDto implements FreezeStatusDto {
  @ApiProperty() contestId: string;
  @ApiProperty() freezeEnabled: boolean;
  @ApiPropertyOptional({ nullable: true }) freezeAt: Date | null;
}

@ApiTags('Freeze')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@ApiForbiddenResponse({ description: 'Not the contest owner or wrong role.' })
@Controller('contests/:contestId/freeze')
export class FreezeController {
  constructor(private readonly freezeService: FreezeService) {}

  // ---------------------------------------------------------------------------
  // POST /contests/:contestId/freeze/enable
  // ---------------------------------------------------------------------------
  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Enable leaderboard freeze for a LIVE contest. ' +
      'Participants see a snapshot; ADMIN/ORGANIZER see live data.',
  })
  @ApiOkResponse({ type: FreezeResponseDto })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  @ApiForbiddenResponse({
    description: 'Contest is not LIVE, or caller lacks permission.',
  })
  enable(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FreezeStatusDto> {
    return this.freezeService.enableFreeze(contestId, user);
  }

  // ---------------------------------------------------------------------------
  // POST /contests/:contestId/freeze/disable
  // ---------------------------------------------------------------------------
  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disable leaderboard freeze, revealing latest rankings to all.',
  })
  @ApiOkResponse({ type: FreezeResponseDto })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  disable(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FreezeStatusDto> {
    return this.freezeService.disableFreeze(contestId, user);
  }
}
