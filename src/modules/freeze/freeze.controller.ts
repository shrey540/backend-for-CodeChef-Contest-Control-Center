import { Controller } from '@nestjs/common';
import { FreezeService } from './freeze.service';

@Controller('contests/:contestId/freeze')
export class FreezeController {
  constructor(private readonly freezeService: FreezeService) {}

  // POST /contests/:contestId/freeze/enable
  enable(_contestId: string): void {
    void this.freezeService;
  }

  // POST /contests/:contestId/freeze/disable
  disable(_contestId: string): void {
    void this.freezeService;
  }
}
