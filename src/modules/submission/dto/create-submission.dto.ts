import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgrammingLanguage } from '../../../common/enums/programming-language.enum';

export class CreateSubmissionDto {
  @ApiProperty()
  @IsUUID('4')
  problemId: string;

  @ApiProperty({ enum: ProgrammingLanguage })
  @IsEnum(ProgrammingLanguage)
  language: ProgrammingLanguage;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  code: string;
}
