import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateIssueDto } from './dto/create-issue.dto';
import { AddCommentDto } from './dto/add-comment.dto';

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
          comments: {
            orderBy: { createdAt: 'desc' },
          },
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
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { id: 'desc' },
      });
    } catch (error: any) {
      console.error('Find all issues error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch issues.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const issue = await this.prisma.issue.findUnique({
        where: { id },
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!issue) {
        throw new NotFoundException(`Issue #${id} not found.`);
      }

      return issue;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Find one issue error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch issue.',
      );
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      await this.ensureIssueExists(id);

      return await this.prisma.issue.update({
        where: { id },
        data: { status },
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Update issue status error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to update issue status.',
      );
    }
  }

  async addComment(id: number, data: AddCommentDto) {
    try {
      await this.ensureIssueExists(id);

      await this.prisma.comment.create({
        data: {
          message: data.message.trim(),
          issueId: id,
        },
      });

      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Add comment error:', error);
      throw new InternalServerErrorException(
        error?.message || 'Failed to add comment.',
      );
    }
  }

  private async ensureIssueExists(id: number) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!issue) {
      throw new NotFoundException(`Issue #${id} not found.`);
    }
  }
}