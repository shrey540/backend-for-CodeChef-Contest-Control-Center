import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContestDto {
  @ApiProperty({ example: 'Summer Coding Challenge 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: '2026-07-01T10:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-07-01T11:30:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  freezeEnabled?: boolean;

  @ApiPropertyOptional({ example: '2026-07-01T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  freezeAt?: string;
}
