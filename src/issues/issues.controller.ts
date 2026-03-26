import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { IssuesService } from './issues.service';

@Controller('issues')
export class IssuesController {
  constructor(private issues: IssuesService) {}

  @Post()
  create(@Body() body: any) {
    return this.issues.create(body);
  }

  @Get()
  findAll() {
    return this.issues.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.issues.updateStatus(Number(id), body.status);
  }
}