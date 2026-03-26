import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [IssuesService, PrismaClient],
  controllers: [IssuesController],
})
export class IssuesModule {}