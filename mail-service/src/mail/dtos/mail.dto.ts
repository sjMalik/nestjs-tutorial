import {
  ArrayMinSize,
  IsDate,
  IsInt,
  IsJSON,
  IsOptional,
  IsString,
} from 'class-validator';
import { MailUsersDto } from './mailUsers.dto';

export class MailDto {
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

  @IsJSON()
  @IsOptional()
  messageProps: any;

  @IsJSON()
  @IsOptional()
  attachments: any;

  @IsDate()
  createdAt: Date;

  @ArrayMinSize(1)
  mailUsers: MailUsersDto[];
}

export class MailIds {
  ids: number[];
}

export class StarUnstarBody {
  ids: number[];
  isStar: boolean;
}
