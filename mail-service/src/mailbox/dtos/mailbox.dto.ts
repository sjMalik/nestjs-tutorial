import {
  ArrayMinSize,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { MailboxUserDto } from './mailboxUser.dto';

export class MailboxDto {
  @IsInt()
  id: number;

  @IsInt()
  @IsOptional()
  parentId: number;

  @IsString()
  @IsOptional()
  subject: string;

  @IsString()
  @IsOptional()
  message: string;

  @IsOptional()
  messageProps: any; // Assuming this can be any type

  @IsOptional()
  attachments: any[]; // Assuming this can be an array of any type

  @IsDate()
  createdAt: Date;

  @ArrayMinSize(1)
  mailboxUsers: MailboxUserDto[]; // Array of MailboxUserDto
}

export class MailIds {
  ids: number[];
}

export class StartUnstarBody {
  ids: number[];
  isStar: boolean;
}
