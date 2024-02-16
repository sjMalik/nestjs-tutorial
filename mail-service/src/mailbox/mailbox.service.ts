// mailbox.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Mailbox } from 'src/typeorm/mailbox.entity';
import {
  MailboxUsers,
  UserFolder,
  UserRole,
  UserStatus,
} from 'src/typeorm/mailbox_users.entity';
import { CreateDraftMailDto } from './dtos/createDraftMail.dto';
import { SendMailDto } from './dtos/sendMail.dto';
import { PaginatedMailsDto } from './dtos/paginatedMail.dto';
import { MailboxDto } from './dtos/mailbox.dto';
import { MailboxUserDto } from './dtos/mailboxUser.dto';

@Injectable()
export class MailboxService {
  private readonly logger = new Logger('EmailService');

  constructor(
    @InjectRepository(Mailbox)
    private readonly mailboxRepository: Repository<Mailbox>,
    @InjectRepository(MailboxUsers)
    private readonly mailboxUsersRepository: Repository<MailboxUsers>,
  ) {}

  async createDraftMail(
    createMailboxDto: CreateDraftMailDto,
    decodedUser: any,
  ): Promise<number> {
    const { parent_id, subject, message, attachments } = createMailboxDto;

    const entityManager = this.mailboxRepository.manager;
    let mailbox_id: number;

    const queryRunner = entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const mailbox = await transactionalEntityManager.save(Mailbox, {
          parent_id,
          subject,
          message,
          attachments: JSON.stringify(attachments),
        });

        mailbox_id = mailbox.id;

        await transactionalEntityManager.save(MailboxUsers, {
          mail: mailbox,
          userId: decodedUser?.userId,
          name: decodedUser?.name,
          email: decodedUser?.email,
          role: 'SENDER',
          folder: 'DRAFT',
        });
      },
    );

    try {
      await queryRunner;
      return mailbox_id;
    } catch (error) {
      this.logger.error('Transaction failed. Rolling back changes...', error);
      throw error; // Re-throwing error for NestJS to handle it
    }
  }

  async sendEmail(
    mailId: number,
    sendMailDto: SendMailDto,
    decodedUser: any,
  ): Promise<void> {
    const { parentId, subject, message, attachments, receivers } = sendMailDto;

    const entityManager = this.mailboxRepository.manager;

    const queryRunner = entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        await transactionalEntityManager.update(
          Mailbox,
          { id: mailId },
          {
            parentId: parentId ? parentId : null,
            subject: subject ? subject : null,
            message: message ? message : null,
            attachments: attachments ? attachments : null,
            createdAt: new Date(),
          },
        );

        await transactionalEntityManager
          .createQueryBuilder()
          .update(MailboxUsers)
          .set({ folder: 'SENT' })
          .where('mail.id = :mailId', { mailId })
          .andWhere('userId = :userId', { userId: decodedUser.userId })
          .execute();

        const recipients = receivers.map((r) => ({
          mail: { id: mailId }, // Assuming Mailbox object is required here
          userId: r.userId,
          name: r.name,
          email: r.email,
          role: 'RECIPIENT',
          status: 'UNREAD',
          folder: 'INBOX',
        }));

        await transactionalEntityManager.insert(MailboxUsers, recipients);
      },
    );

    try {
      await queryRunner;
    } catch (error) {
      console.error('Transaction failed. Rolling back changes...', error);
      throw error; // Re-throwing error for NestJS to handle it
    }
  }

  async moveToTrash(userId: number, mailIds: number[]): Promise<void> {
    // Remove duplicates from mailIds
    console.log(userId, mailIds)
    const uniqueMailIds = [...new Set(mailIds)];

    // Update mailbox_users table using TypeORM
    const query = this.mailboxUsersRepository
      .createQueryBuilder()
      .update(MailboxUsers)
      .set({ folder: 'TRASH' }) // Set folder to 'TRASH'
      .where('mail.id IN (:...mailIds)', { mailIds: uniqueMailIds }) // Filter by mailIds
      .andWhere('userId = :userId', { userId }) // Filter by userId
      .execute();

    await query;
  }

  async markAsRead(userId: number, mailIds: number[]): Promise<void> {
    console.log(userId, mailIds)
    // Remove duplicates from mailIds
    const uniqueMailIds = [...new Set(mailIds)];

    // Update mailbox_users table using TypeORM
    await this.mailboxUsersRepository
      .createQueryBuilder()
      .update(MailboxUsers)
      .set({ status: UserStatus.READ }) // Set folder to 'TRASH'
      .where('mail.id IN (:...mailIds)', { mailIds: uniqueMailIds }) // Filter by mailIds
      .andWhere('userId = :userId', { userId }) // Filter by userId
      .andWhere('role = :role', { role: UserRole.RECIPIENT })
      .andWhere('status = :status', { status: UserStatus.UNREAD })
      .execute();
  }

  async markAllAsRead(userId: number): Promise<void> {
    // Update mailbox_users table using TypeORM
    await this.mailboxUsersRepository
      .createQueryBuilder()
      .update(MailboxUsers)
      .set({ status: UserStatus.READ }) // Set folder to 'READ'
      .andWhere('userId = :userId', { userId }) // Filter by userId
      .andWhere('role = :role', { role: UserRole.RECIPIENT })
      .andWhere('status = :status', { status: UserStatus.UNREAD })
      .execute();
  }

  async fetchInboxOrSentMails(
    userId: number,
    page: number,
    perPage: number,
    role: UserRole,
    folder: UserFolder,
  ): Promise<PaginatedMailsDto> {
    page = page ? page : 1;
    perPage = perPage ? perPage : 10;
    // Calculate offset and limit
    const offset = (page - 1) * perPage;
    const limit = perPage;

    try {
      const mails = await this.mailboxUsersRepository
        .createQueryBuilder('mailboxUser')
        .select('mailboxUser.mailId', 'mail_id')
        .where('mailboxUser.userId = :userId', { userId })
        .andWhere('mailboxUser.role = :role', { role })
        .andWhere('mailboxUser.folder = :folder', { folder })
        .distinct(true)
        .getRawMany();

      const mailIds = mails.map((mail) => mail.mail_id);
      if (mailIds.length === 0) {
        const responseDto: PaginatedMailsDto = {
          results: [],
          totalCount: 0,
        };
        return responseDto;
      }

      const [results, totalCount] = await this.mailboxRepository
        .createQueryBuilder('mailbox')
        .innerJoinAndSelect('mailbox.mailboxUsers', 'mailboxUsers')
        .where('mailbox.id IN (:...mailIds)', { mailIds })
        .orderBy('mailbox.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getManyAndCount();

      const mailboxDtos: MailboxDto[] = results.map((result) => {
        const mailboxDto: MailboxDto = {
          id: result.id,
          parentId: result.parentId,
          subject: result.subject,
          message: result.message,
          messageProps: result.messageProps,
          attachments: result.attachments,
          createdAt: result.createdAt,
          mailboxUsers: result.mailboxUsers.map((user) => {
            const mailboxUserDto: MailboxUserDto = {
              id: user.id,
              userId: user.userId,
              name: user.name,
              email: user.email,
              role: user.role as UserRole,
              status: user.status as UserStatus,
              star: user.star,
              folder: user.folder as UserFolder,
              createdAt: user.createdAt,
            };
            return mailboxUserDto;
          }),
        };
        return mailboxDto;
      });

      const responseDto: PaginatedMailsDto = {
        results: mailboxDtos,
        totalCount: totalCount,
      };

      return responseDto;
    } catch (error) {
      console.error('Failed to get the list InboxOrSentMail', error);
      throw error; // Re-throwing error for NestJS to handle it
    }
  }

  async fetchTrashMails(
    userId: number,
    page: number,
    perPage: number,
  ): Promise<PaginatedMailsDto> {
    page = page ? page : 1;
    perPage = perPage ? perPage : 10;
    // Calculate offset and limit
    const offset = (page - 1) * perPage;
    const limit = perPage;

    try {
      const mails = await this.mailboxUsersRepository.query(
        `
        SELECT DISTINCT mailUsers."mailId" AS mail_id
        FROM mailbox_users mailUsers
        WHERE mailUsers."userId" = $1
        AND mailUsers.folder = 'TRASH'
      `,
        [userId],
      );

      const mailIds = mails.map((mail) => mail.mail_id);
      if (mailIds.length === 0) {
        const responseDto: PaginatedMailsDto = {
          results: [],
          totalCount: 0,
        };
        return responseDto;
      }
      console.log(mailIds);

      const [results, totalCount] = await this.mailboxRepository
        .createQueryBuilder('mailbox')
        .innerJoinAndSelect('mailbox.mailboxUsers', 'mailboxUsers')
        .where('mailbox.id IN (:...mailIds)', { mailIds })
        .orderBy('mailbox.createdAt', 'DESC')
        .offset(offset)
        .limit(limit)
        .getManyAndCount();

      const mailboxDtos: MailboxDto[] = results.map((result) => {
        const mailboxDto: MailboxDto = {
          id: result.id,
          parentId: result.parentId,
          subject: result.subject,
          message: result.message,
          messageProps: result.messageProps,
          attachments: result.attachments,
          createdAt: result.createdAt,
          mailboxUsers: result.mailboxUsers.map((user) => {
            const mailboxUserDto: MailboxUserDto = {
              id: user.id,
              userId: user.userId,
              name: user.name,
              email: user.email,
              role: user.role as UserRole,
              status: user.status as UserStatus,
              star: user.star,
              folder: user.folder as UserFolder,
              createdAt: user.createdAt,
            };
            return mailboxUserDto;
          }),
        };
        return mailboxDto;
      });

      const responseDto: PaginatedMailsDto = {
        results: mailboxDtos,
        totalCount: totalCount,
      };

      return responseDto;
    } catch (error) {
      console.error('Failed to get the list InboxOrSentMail', error);
      throw error; // Re-throwing error for NestJS to handle it
    }
  }
}
