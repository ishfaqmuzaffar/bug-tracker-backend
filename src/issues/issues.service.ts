import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaClient) {}

  create(data: any) {
    return this.prisma.issue.create({
      data,
    });
  }

  findAll() {
    return this.prisma.issue.findMany({
      include: { comments: true },
    });
  }

  updateStatus(id: number, status: string) {
    return this.prisma.issue.update({
      where: { id },
      data: { status },
    });
  }
}