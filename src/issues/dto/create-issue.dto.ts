import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Open', 'In Progress', 'Resolved', 'Closed'])
  status!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Low', 'Medium', 'High', 'Critical'])
  priority!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  project!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  assignee!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  reporter!: string;
}