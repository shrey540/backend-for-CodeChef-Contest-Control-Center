import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmissionListQueryDto } from './dto/submission-list-query.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@Controller('contests/:contestId')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  // ---------------------------------------------------------------------------
  // POST /contests/:contestId/submissions
  // ---------------------------------------------------------------------------
  @Post('submissions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a submission for a problem in this contest' })
  @ApiCreatedResponse({ type: SubmissionResponseDto })
  @ApiNotFoundResponse({ description: 'Contest or problem not found.' })
  @ApiForbiddenResponse({
    description:
      'Contest has ended | participant not registered | insufficient role.',
  })
  create(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Body() dto: CreateSubmissionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.create(contestId, dto, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/submissions   (ADMIN / ORGANIZER owner)
  // ---------------------------------------------------------------------------
  @Get('submissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'List all submissions for a contest (ADMIN / ORGANIZER)' })
  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  @ApiForbiddenResponse({ description: 'Not the contest owner.' })
  findAll(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Query() query: SubmissionListQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionService.findAll(contestId, user, query);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/submissions/:submissionId
  // ---------------------------------------------------------------------------
  @Get('submissions/:submissionId')
  @ApiOperation({
    summary:
      'Get a single submission. ADMIN: any. ORGANIZER: own contest. PARTICIPANT: own submissions only.',
  })
  @ApiOkResponse({ type: SubmissionResponseDto })
  @ApiNotFoundResponse({ description: 'Contest or submission not found.' })
  @ApiForbiddenResponse({ description: 'Participant viewing someone else\'s submission.' })
  findOne(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto> {
    return this.submissionService.findOne(contestId, submissionId, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/participants/:participantId/submissions
  // ---------------------------------------------------------------------------
  @Get('participants/:participantId/submissions')
  @ApiOperation({
    summary:
      'Get submissions by participant. ADMIN: any. ORGANIZER: own contest. PARTICIPANT: own only.',
  })
  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @ApiNotFoundResponse({ description: 'Contest not found.' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions.' })
  findByParticipant(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('participantId', ParseUUIDPipe) participantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionService.findByParticipant(contestId, participantId, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/problems/:problemId/submissions
  // ---------------------------------------------------------------------------
  @Get('problems/:problemId/submissions')
  @ApiOperation({
    summary:
      'Get submissions for a problem. ADMIN: all. ORGANIZER: own contest. PARTICIPANT: own only.',
  })
  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @ApiNotFoundResponse({ description: 'Contest or problem not found.' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions.' })
  findByProblem(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionService.findByProblem(contestId, problemId, user);
  }
}
