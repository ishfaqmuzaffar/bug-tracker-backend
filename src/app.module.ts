import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from './auth/auth.module';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [AuthModule, IssuesModule],
  providers: [PrismaClient],
})
export class AppModule {}