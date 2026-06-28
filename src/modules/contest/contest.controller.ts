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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

import { ContestService } from './contest.service';
import {
  ContestResponseDto,
  CreateContestDto,
  UpdateContestDto,
} from './dto';

@ApiTags('Contests')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
@Controller('contests')
@UseGuards(JwtAuthGuard)
export class ContestController {
  constructor(
    private readonly contestService: ContestService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Create a contest' })
  @ApiCreatedResponse({ type: ContestResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT',
  })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN or ORGANIZER role',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContestDto,
  ): Promise<ContestResponseDto> {
    return this.contestService.create(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List contests visible to the authenticated user',
  })
  @ApiOkResponse({
    type: ContestResponseDto,
    isArray: true,
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestResponseDto[]> {
    return this.contestService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contest details' })
  @ApiOkResponse({ type: ContestResponseDto })
  @ApiNotFoundResponse({
    description: 'Contest not found',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestResponseDto> {
    return this.contestService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Update contest' })
  @ApiOkResponse({ type: ContestResponseDto })
  @ApiConflictResponse({
    description: 'Contest cannot be updated',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateContestDto,
  ): Promise<ContestResponseDto> {
    return this.contestService.update(id, user, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Delete contest' })
  @ApiNoContentResponse({
    description: 'Contest deleted',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.contestService.remove(id, user);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Start contest' })
  @ApiOkResponse({ type: ContestResponseDto })
  @ApiConflictResponse({
    description: 'Contest cannot be started',
  })
  start(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestResponseDto> {
    return this.contestService.start(id, user);
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'End contest' })
  @ApiOkResponse({ type: ContestResponseDto })
  @ApiConflictResponse({
    description: 'Contest must be live to end',
  })
  end(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ContestResponseDto> {
    return this.contestService.end(id, user);
  }
}