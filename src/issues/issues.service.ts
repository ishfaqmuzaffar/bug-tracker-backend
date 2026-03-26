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
                attachmentPath: attachment.path.replaceAll('\\', '/'),
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

      if (error?.code === 'P2002') {
        throw new BadRequestException('Duplicate issue data is not allowed.');
      }

      if (error?.code === 'P2003') {
        throw new BadRequestException('Invalid related record provided.');
      }

      throw new InternalServerErrorException(
        error?.message || 'Failed to create issue.',
      );
    }
  }

  async findAll() {
    return this.prisma.issue.findMany({
      include: { comments: true },
      orderBy: { id: 'desc' },
    });
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