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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemDifficulty } from '@prisma/client';

export class CreateProblemDto {
  @ApiProperty({
    example: 'A',
    description:
      'Short label unique within this contest (A, B, C, …). ' +
      'Must be 1–10 uppercase letters or digits.',
  })
  @IsString()
  @Matches(/^[A-Z0-9]{1,10}$/, {
    message: 'code must be 1–10 uppercase letters or digits (e.g. A, B, C1)',
  })
  code: string;

  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Given an array of integers, find indices of the two numbers that add up to target.',
    description: 'Full problem statement (body text).',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  statement: string;

  @ApiProperty({ enum: ProblemDifficulty, example: ProblemDifficulty.MEDIUM })
  @IsEnum(ProblemDifficulty)
  difficulty: ProblemDifficulty;

  @ApiProperty({ example: 100, description: 'Points awarded for solving this problem.' })
  @IsInt()
  @Min(0)
  points: number;

  @ApiPropertyOptional({ example: 2000, description: 'Time limit in milliseconds.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMs?: number;

  @ApiPropertyOptional({ example: 256, description: 'Memory limit in megabytes.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  memoryLimitMb?: number;
}
