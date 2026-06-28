import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contestService: ContestService,
  ) {}

  // register, findAll, findMine
  // assertRegistered, isRegistered
}
