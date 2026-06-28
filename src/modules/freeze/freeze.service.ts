import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';

@Injectable()
export class FreezeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
  ) {}

  // enableFreeze, disableFreeze
}
