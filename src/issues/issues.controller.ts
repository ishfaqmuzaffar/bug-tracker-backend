import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

function editFileName(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(file.originalname).toLowerCase();
  callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
}

function fileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const ext = extname(file.originalname).toLowerCase();

  const allowedExt = ['.png', '.jpg', '.jpeg', '.pdf', '.txt', '.zip'];
  const allowedMime = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'multipart/x-zip',
    'application/octet-stream',
  ];

  const isValidExt = allowedExt.includes(ext);
  const isValidMime = allowedMime.includes(file.mimetype);

  if (!isValidExt && !isValidMime) {
    return callback(
      new BadRequestException(
        'Only PNG, JPG, PDF, TXT and ZIP files are allowed.',
      ) as any,
      false,
    );
  }

  callback(null, true);
}

@Controller('issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issues: IssuesService) {}

  @Post()
  @Roles('ADMIN', 'TESTER', 'DEVELOPER')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/issues',
        filename: editFileName,
      }),
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() body: CreateIssueDto,
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    return this.issues.create(body, attachment);
  }

  @Get()
  @Roles('ADMIN', 'DEVELOPER', 'TESTER')
  findAll() {
    return this.issues.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'DEVELOPER', 'TESTER')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.issues.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'DEVELOPER')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateIssueStatusDto,
  ) {
    return this.issues.updateStatus(id, body.status);
  }

  @Post(':id/comments')
  @Roles('ADMIN', 'DEVELOPER', 'TESTER')
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddCommentDto,
  ) {
    return this.issues.addComment(id, body);
  }
}