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

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
    @InjectRepository(MailUsers)
    private readonly mailUsersRepository: Repository<MailUsers>,
  ) {}

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
      // .createQueryBuilder('mailUsers')
      // .select('mailUsers.mailId', 'mail_id')
      // .where('mailUsers.userId=:userId', { userId })
      // .andWhere('maliUsers.role=:role', { role })
      // .andWhere('mailUsers.folder=:folder', { folder })
      // .distinct(true)
      // .getRawMany();

      const mailIds = mails.map((mail) => mail.mail_id);
      this.logger.debug('MailIds', mailIds);

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
}
