import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'System Admin' })
  name: string;

  @ApiProperty({ example: 'admin@codechef.local' })
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
