import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mail } from 'src/typeorm/mail.entity';
import {
  MailUsers,
  UserFolder,
  UserRole,
  UserStatus,
} from 'src/typeorm/mailUsers.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateDraftMailDto } from './dtos/createDraftMail.dto';
import { DecodedUserDto } from './dtos/decodedUser.dto';
import { PaginatedMailsDto } from './dtos/paginatedMails.dto';
import { MailDto } from './dtos/mail.dto';
import { MailUsersDto } from './dtos/mailUsers.dto';
import { SendMailDto } from './dtos/sendMail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
    @InjectRepository(MailUsers)
    private readonly mailUsersRepository: Repository<MailUsers>,
  ) { }

  async createDraftMail(
    createDraftMailDto: CreateDraftMailDto,
    decodedUser: DecodedUserDto,
  ): Promise<number> {
    const { parentId, subject, message, attachments } = createDraftMailDto;

    const entityManager = this.mailRepository.manager;
    let mailId: number;

    const queryRunner = entityManager.transaction(
      async (transactionEntityManager: EntityManager) => {
        const mail = await transactionEntityManager.save(Mail, {
          parentId,
          subject,
          message,
          attachments: JSON.stringify(attachments),
        });
        mailId = mail.id;

        await transactionEntityManager.save(MailUsers, {
          mail,
          userId: decodedUser.userId,
          name: decodedUser.name,
          email: decodedUser.email,
          role: UserRole.SENDER,
          folder: UserFolder.DARFT,
        });
      },
    );

    try {
      await queryRunner;
      return mailId;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async fetchMailList(
    userId: number,
    role: UserRole,
    folder: UserFolder,
    page?: number,
    perPage?: number,
  ): Promise<PaginatedMailsDto> {
    page = page ? page : 1;
    perPage = perPage ? perPage : 10;

    this.logger.debug(typeof userId, page, perPage);

    // Calculate offset and limit
    const offset = (page - 1) * perPage;
    const limit = perPage;

    try {
      const mails = await this.mailUsersRepository.query(
        `
        SELECT DISTINCT mailUsers."mailId" AS mail_id
        FROM mail_users mailUsers
        WHERE mailUsers."userId" = $1
        AND mailUsers.role = $2
        AND mailUsers.folder = $3
      `,
        [userId, role, folder],
      );

      const mailIds = mails.map((mail) => mail.mail_id);

      if (mailIds.length === 0) {
        const response: PaginatedMailsDto = {
          results: [],
          totalCount: 0,
        };

        return response;
      }

      const [results, totalCount] = await this.mailRepository
        .createQueryBuilder('mail')
        .innerJoinAndSelect('mail.mailUsers', 'mailUsers')
        .where('mail.id IN (:...mailIds)', { mailIds })
        .offset(offset)
        .limit(limit)
        .getManyAndCount();

      const mailDtos: MailDto[] = results.map((result) => {
        const mailDto: MailDto = {
          id: result.id,
          parentId: result.parentId,
          message: result.message,
          subject: result.subject,
          messageProps: result.messageProps,
          attachments: result.attachments,
          createdAt: result.createdAt,
          mailUsers: result.mailUsers.map((mailUser) => {
            const mailUserDto: MailUsersDto = {
              id: mailUser.id,
              userId: mailUser.userId,
              name: mailUser.name,
              email: mailUser.email,
              role: mailUser.role as UserRole,
              status: mailUser.status as UserStatus,
              star: mailUser.star,
              folder: mailUser.folder as UserFolder,
              createdAt: mailUser.createdAt,
            };
            return mailUserDto;
          }),
        };
        return mailDto;
      });

      const responseDto: PaginatedMailsDto = {
        results: mailDtos,
        totalCount,
      };

      return responseDto;
    } catch (e) {
      this.logger.error('Failed to fetch mail list', e);
      throw e;
    }
  }

  async sendEmail(
    mailId: number,
    sendMailDto: SendMailDto,
    decodedUser: any,
  ): Promise<any> {
    const { subject, parentId, message, attachments, receivers } = sendMailDto;

    const entityManager = this.mailRepository.manager;

    const queryRunner = entityManager.transaction(
      async (transactionEntityManager: EntityManager) => {
        await transactionEntityManager.update(
          Mail,
          { id: mailId },
          {
            parentId,
            subject,
            message,
            attachments,
            createdAt: new Date(),
          },
        );

        await transactionEntityManager
          .createQueryBuilder()
          .update(MailUsers)
          .set({ folder: UserFolder.SENT })
          .where('mail.id = :mailId', { mailId })
          .andWhere('userId = :userId', { userId: decodedUser.userId })
          .execute();

        const recepients = receivers.map((receiver) => ({
          mail: { id: mailId },
          userId: receiver.userId,
          name: receiver.name,
          email: receiver.email,
          role: UserRole.RECEIPENT,
          folder: UserFolder.INBOX,
        }));

        await transactionEntityManager.insert(MailUsers, recepients);
      },
    );

    try {
      await queryRunner;
    } catch (e) {
      this.logger.error('Rolling back the transactions', e);
      throw e;
    }
  }

  async moveToTrash(userId: number, mailIds: number[]): Promise<void> {
    const uniqueMailIds = [...new Set(mailIds)];

    await this.mailUsersRepository
      .createQueryBuilder()
      .update(MailUsers)
      .set({ folder: UserFolder.TRASH })
      .where('userId = :userId', { userId })
      .andWhere('mail.id IN (:...mailIds)', { mailIds: uniqueMailIds })
      .execute();
  }

  async fetchTrashMailList(
    userId: number,
    page?: number,
    perPage?: number,
  ): Promise<PaginatedMailsDto> {
    page = page ? page : 1;
    perPage = perPage ? perPage : 10;

    // Calculate offset and limit
    const offset = (page - 1) * perPage;
    const limit = perPage;

    try {
      const mails = await this.mailUsersRepository.query(
        `
        SELECT DISTINCT mailUsers."mailId" AS mail_id
        FROM mail_users mailUsers
        WHERE mailUsers."userId" = $1
        AND mailUsers.folder = 'TRASH'
      `,
        [userId],
      );

      const mailIds = mails.map((mail) => mail.mail_id);

      if (mailIds.length === 0) {
        const response: PaginatedMailsDto = {
          results: [],
          totalCount: 0,
        };

        return response;
      }

      const [results, totalCount] = await this.mailRepository
        .createQueryBuilder('mail')
        .innerJoinAndSelect('mail.mailUsers', 'mailUsers')
        .where('mail.id IN (:...mailIds)', { mailIds })
        .offset(offset)
        .limit(limit)
        .getManyAndCount();

      const mailDtos: MailDto[] = results.map((result) => {
        const mailDto: MailDto = {
          id: result.id,
          parentId: result.parentId,
          message: result.message,
          subject: result.subject,
          messageProps: result.messageProps,
          attachments: result.attachments,
          createdAt: result.createdAt,
          mailUsers: result.mailUsers.map((mailUser) => {
            const mailUserDto: MailUsersDto = {
              id: mailUser.id,
              userId: mailUser.userId,
              name: mailUser.name,
              email: mailUser.email,
              role: mailUser.role as UserRole,
              status: mailUser.status as UserStatus,
              star: mailUser.star,
              folder: mailUser.folder as UserFolder,
              createdAt: mailUser.createdAt,
            };
            return mailUserDto;
          }),
        };
        return mailDto;
      });

      const responseDto: PaginatedMailsDto = {
        results: mailDtos,
        totalCount,
      };

      return responseDto;
    } catch (e) {
      this.logger.error('Failed to fetch mail list', e);
      throw e;
    }
  }

  async startUnstarMails(
    userId: number,
    mailIds: number[],
    isStar: boolean,
  ): Promise<void> {
    const uniqueMailIds = [...new Set(mailIds)];

    await this.mailUsersRepository
      .createQueryBuilder()
      .update(MailUsers)
      .set({ star: isStar })
      .where('userId = :userId', { userId })
      .andWhere('mail.id IN (:...mailIds)', { mailIds: uniqueMailIds })
      .execute();
  }

  async markAsRead(
    userId: number,
    mailIds: number[]
  ): Promise<void> {
    const uniqueMailIds = [...new Set(mailIds)];

    await this.mailUsersRepository
      .createQueryBuilder()
      .update(MailUsers)
      .set({ status: UserStatus.READ })
      .where('userId = :userId', { userId })
      .andWhere('mail.id IN (:...mailIds)', { mailIds: uniqueMailIds })
      .andWhere('role = :role', { role: UserRole.RECEIPENT })
      .andWhere('status = :status', { status: UserStatus.UNREAD })
      .execute();
  }

  async markAllAsRead(
    userId: number,
  ): Promise<void> {
    await this.mailUsersRepository
      .createQueryBuilder()
      .update(MailUsers)
      .set({ status: UserStatus.READ })
      .where('userId = :userId', { userId })
      .andWhere('role = :role', { role: UserRole.RECEIPENT })
      .andWhere('status = :status', { status: UserStatus.UNREAD })
      .execute();
  }
}
