import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateIssueDto } from './dto/create-issue.dto';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateIssueDto, attachment?: Express.Multer.File) {
    try {
      return await this.prisma.issue.create({
        data: {
          title: data.title.trim(),
          description: data.description.trim(),
          status: data.status,
          priority: data.priority,
          project: data.project.trim(),
          assignee: data.assignee.trim(),
          reporter: data.reporter.trim(),
          ...(attachment
            ? {
                attachmentName: attachment.originalname,
                attachmentPath: attachment.path.replace(/\\/g, '/'),
                attachmentMimeType: attachment.mimetype,
              }
            : {}),
        },
        include: {
          comments: true,
        },
      });
    } catch (error: any) {
      console.error('Create issue error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to create issue.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.issue.findMany({
        include: { comments: true },
        orderBy: { id: 'desc' },
      });
    } catch (error: any) {
      console.error('Find all issues error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch issues.',
      );
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      return await this.prisma.issue.update({
        where: { id },
        data: { status },
      });
    } catch (error: any) {
      console.error('Update issue status error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to update issue status.',
      );
    }
  }
}