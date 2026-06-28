import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contestId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  registeredAt: Date;
}
