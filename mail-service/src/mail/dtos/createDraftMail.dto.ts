import { IsNumber, IsString, IsOptional, IsJSON } from 'class-validator';

export class CreateDraftMailDto {
  @IsOptional()
  @IsNumber()
  parentId: number;

  @IsOptional()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsJSON()
  attachments: any;
}
