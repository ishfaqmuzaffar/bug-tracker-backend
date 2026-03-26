import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateIssueStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['Open', 'In Progress', 'Resolved', 'Closed'])
  status!: string;
}