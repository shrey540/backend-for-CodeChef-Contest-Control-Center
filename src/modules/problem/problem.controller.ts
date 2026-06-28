import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiConflictResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ProblemService } from './problem.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { ProblemResponseDto } from './dto/problem-response.dto';

@ApiTags('Problems')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@UseGuards(JwtAuthGuard)
@Controller('contests/:contestId/problems')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  // ---------------------------------------------------------------------------
  // POST /contests/:contestId/problems
  // ---------------------------------------------------------------------------
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Add a problem to a contest (ADMIN or ORGANIZER owner)' })
  @ApiCreatedResponse({ type: ProblemResponseDto })
  @ApiNotFoundResponse({ description: 'Contest not found' })
  @ApiForbiddenResponse({ description: 'Forbidden — not owner or wrong role' })
  @ApiConflictResponse({ description: 'Duplicate code or title within contest' })
  async create(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Body() dto: CreateProblemDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProblemResponseDto> {
    return this.problemService.create(contestId, dto, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/problems
  // ---------------------------------------------------------------------------
  @Get()
  @ApiOperation({ summary: 'List all problems for a contest' })
  @ApiOkResponse({ type: [ProblemResponseDto] })
  @ApiNotFoundResponse({ description: 'Contest not found or not visible' })
  async findAll(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProblemResponseDto[]> {
    return this.problemService.findAll(contestId, user);
  }

  // ---------------------------------------------------------------------------
  // GET /contests/:contestId/problems/:id
  // ---------------------------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get a single problem by ID' })
  @ApiOkResponse({ type: ProblemResponseDto })
  @ApiNotFoundResponse({ description: 'Contest or problem not found' })
  async findOne(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProblemResponseDto> {
    return this.problemService.findOne(contestId, id, user);
  }

  // ---------------------------------------------------------------------------
  // PATCH /contests/:contestId/problems/:id
  // ---------------------------------------------------------------------------
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Update a problem (ADMIN or ORGANIZER owner)' })
  @ApiOkResponse({ type: ProblemResponseDto })
  @ApiNotFoundResponse({ description: 'Contest or problem not found' })
  @ApiForbiddenResponse({ description: 'Forbidden — ended contest or wrong role' })
  @ApiConflictResponse({ description: 'Duplicate code or title within contest' })
  async update(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProblemDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProblemResponseDto> {
    return this.problemService.update(contestId, id, dto, user);
  }

  // ---------------------------------------------------------------------------
  // DELETE /contests/:contestId/problems/:id
  // ---------------------------------------------------------------------------
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Delete a problem (ADMIN or ORGANIZER owner)' })
  @ApiNoContentResponse({ description: 'Problem deleted' })
  @ApiNotFoundResponse({ description: 'Contest or problem not found' })
  @ApiForbiddenResponse({ description: 'Forbidden — ended contest or wrong role' })
  @ApiConflictResponse({ description: 'Cannot delete: submissions exist' })
  async remove(
    @Param('contestId', ParseUUIDPipe) contestId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.problemService.remove(contestId, id, user);
  }
}
