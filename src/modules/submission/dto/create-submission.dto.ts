import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgrammingLanguage } from '@prisma/client';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID('4')
  problemId: string;

  @ApiProperty({ enum: ProgrammingLanguage, example: ProgrammingLanguage.CPP })
  @IsEnum(ProgrammingLanguage)
  language: ProgrammingLanguage;

  @ApiProperty({
    example: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){}',
    description: 'Source code (max 50 000 characters).',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  code: string;
}
