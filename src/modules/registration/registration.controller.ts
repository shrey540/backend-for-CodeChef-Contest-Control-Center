import { Controller } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller('contests/:contestId/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  // POST /contests/:contestId/registrations
  register(_contestId: string): void {
    void this.registrationService;
  }

  // GET  /contests/:contestId/registrations
  findAll(_contestId: string): void {
    void this.registrationService;
  }

  // GET  /contests/:contestId/registrations/me
  findMine(_contestId: string): void {
    void this.registrationService;
  }
}
