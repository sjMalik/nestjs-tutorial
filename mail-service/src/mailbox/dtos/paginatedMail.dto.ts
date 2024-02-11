import { IsInt } from 'class-validator';
import { MailboxDto } from './mailbox.dto';

export class PaginatedMailsDto {
  results: MailboxDto[];

  @IsInt()
  totalCount: number;
}
