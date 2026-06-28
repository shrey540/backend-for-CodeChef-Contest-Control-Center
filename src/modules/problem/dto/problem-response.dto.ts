import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemDifficulty } from '@prisma/client';

export class ProblemResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' })
  contestId: string;

  @ApiPropertyOptional({ example: 'A', nullable: true })
  code: string | null;

  @ApiProperty({ example: 'Two Sum' })
  title: string;

  @ApiProperty({ example: 'Given an array of integers, find indices of the two numbers…' })
  statement: string;

  @ApiProperty({ enum: ProblemDifficulty })
  difficulty: ProblemDifficulty;

  @ApiProperty({ example: 100 })
  points: number;

  @ApiProperty({ example: 2000 })
  timeLimitMs: number;

  @ApiProperty({ example: 256 })
  memoryLimitMb: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
