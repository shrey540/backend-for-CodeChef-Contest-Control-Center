import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' })
  contestId: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d481' })
  userId: string;

  @ApiProperty()
  registeredAt: Date;
}
