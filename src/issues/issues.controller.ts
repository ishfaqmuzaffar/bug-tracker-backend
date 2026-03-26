import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';

function editFileName(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(file.originalname);
  callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
}

function fileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const allowed = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (!allowed.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Only PNG, JPG, PDF, TXT and ZIP files are allowed.') as any,
      false,
    );
  }

  callback(null, true);
}

@Controller('issues')
export class IssuesController {
  constructor(private readonly issues: IssuesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/issues',
        filename: editFileName,
      }),
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
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
  findAll() {
    return this.issues.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateIssueStatusDto,
  ) {
    return this.issues.updateStatus(id, body.status);
  }
}