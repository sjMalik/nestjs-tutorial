// create-mailbox.dto.ts
import { IsString, IsOptional, IsJSON, IsNumber } from 'class-validator';

export class CreateDraftMailDto {
  @IsOptional()
  @IsNumber()
  parent_id: number;

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
