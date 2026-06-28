import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SubmissionVerdict } from '../../../common/enums/submission-verdict.enum';

export class SubmissionListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  participantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  problemId?: string;

  @ApiPropertyOptional({ enum: SubmissionVerdict })
  @IsOptional()
  @IsEnum(SubmissionVerdict)
  verdict?: SubmissionVerdict;
}
