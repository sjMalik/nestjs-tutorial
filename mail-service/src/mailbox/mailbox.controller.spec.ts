import { Test, TestingModule } from '@nestjs/testing';
import { MailboxController } from './mailbox.controller';

describe('MailboxController', () => {
  let controller: MailboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailboxController],
    }).compile();

    controller = module.get<MailboxController>(MailboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
