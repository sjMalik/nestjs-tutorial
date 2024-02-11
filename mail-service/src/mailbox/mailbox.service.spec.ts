import { Test, TestingModule } from '@nestjs/testing';
import { MailboxService } from './mailbox.service';

describe('MailboxService', () => {
  let service: MailboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailboxService],
    }).compile();

    service = module.get<MailboxService>(MailboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
