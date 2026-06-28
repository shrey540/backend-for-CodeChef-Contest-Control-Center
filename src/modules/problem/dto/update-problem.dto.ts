import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemDifficulty } from '@prisma/client';

export class UpdateProblemDto {
  @ApiPropertyOptional({ example: 'B' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{1,10}$/, {
    message: 'code must be 1–10 uppercase letters or digits',
  })
  code?: string;

  @ApiPropertyOptional({ example: 'Three Sum' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  statement?: string;

  @ApiPropertyOptional({ enum: ProblemDifficulty })
  @IsOptional()
  @IsEnum(ProblemDifficulty)
  difficulty?: ProblemDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  memoryLimitMb?: number;
}
