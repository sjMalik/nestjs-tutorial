import { IsInt } from 'class-validator';
import { MailDto } from './mail.dto';

export class PaginatedMailsDto {
  results: MailDto[];

  @IsInt()
  totalCount: number;
}
