import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
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
import { RegistrationService } from './registration.service';
import { RegistrationResponseDto } from './dto/registration-response.dto';

@ApiTags('Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@Controller('contests/:contestId/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  // ---------------------------------------------------------------------------
  // POST /contests/:contestId/registrations
  // ---------------------------------------------------------------------------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Register the calling user for a contest' })
  @ApiCreatedResponse({ type: RegistrationResponseDto })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  @ApiForbiddenResponse({
    description: 'Registration is closed (contest is LIVE or ENDED).',
  })
  @ApiConflictResponse({
    description: 'Participant is already registered for this contest.',
  })
  register(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    return this.registrationService.register(contestId, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/registrations
  // ---------------------------------------------------------------------------
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'List all registrations for a contest (ADMIN / ORGANIZER owner)' })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  @ApiForbiddenResponse({ description: 'Not the contest owner.' })
  findAll(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RegistrationResponseDto[]> {
    return this.registrationService.findAll(contestId, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/registrations/:participantId
  // ---------------------------------------------------------------------------
  @Get(':participantId')
  @ApiOperation({
    summary:
      'Get a single registration. PARTICIPANT can only view their own. ' +
      'ORGANIZER can view registrations for their contests. ADMIN can view any.',
  })
  @ApiOkResponse({ type: RegistrationResponseDto })
  @ApiNotFoundResponse({ description: 'Contest or registration not found.' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions.' })
  findOne(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('participantId', ParseUUIDPipe) participantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RegistrationResponseDto> {
    return this.registrationService.findOne(contestId, participantId, user);
  }
}
