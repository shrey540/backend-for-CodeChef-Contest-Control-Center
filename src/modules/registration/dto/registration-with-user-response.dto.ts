import { ApiProperty } from '@nestjs/swagger';
import { RegistrationResponseDto } from './registration-response.dto';

export class ParticipantSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class RegistrationWithUserResponseDto extends RegistrationResponseDto {
  @ApiProperty({ type: ParticipantSummaryDto })
  participant: ParticipantSummaryDto;
}
