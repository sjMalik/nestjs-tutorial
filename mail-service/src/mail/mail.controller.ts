import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  Param,
  UseGuards,
  Delete,
  Put,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateDraftMailDto } from './dtos/createDraftMail.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { PaginatedMailsDto } from './dtos/paginatedMails.dto';
import { UserFolder, UserRole } from 'src/typeorm/mailUsers.entity';
import { SendMailDto } from './dtos/sendMail.dto';
import { MailIds, StarUnstarBody } from './dtos/mail.dto';

@Controller('emails')
@ApiBearerAuth()
export class MailController {
  private readonly logger = new Logger('Mail Controller');

  constructor(private readonly mailService: MailService) { }

  @Post('')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create Draft Mail',
    description: '',
  })
  @ApiResponse({ status: 201, description: 'Draft Email Saved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createDraftMail(
    @Body() createDraftMailDto: CreateDraftMailDto,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      const mailId = await this.mailService.createDraftMail(
        createDraftMailDto,
        req.user,
      );

      return res.status(HttpStatus.OK).json({ mailId }).end();
    } catch (e) {
      this.logger.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Get('draft')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Ftech Draft Mail List',
    description: '',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiResponse({ status: 200, description: 'Draft Email Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDraftMails(
    @Req() req,
    @Res() res,
    @Query('page', ParseIntPipe) page?: number,
    @Query('perPage', ParseIntPipe) perPage?: number,
  ): Promise<PaginatedMailsDto> {
    try {
      const draftMailsRes = await this.mailService.fetchMailList(
        req.user.userId,
        UserRole.SENDER,
        UserFolder.DARFT,
        page,
        perPage,
      );

      return res.status(HttpStatus.OK).json(draftMailsRes).end();
    } catch (e) {
      this.logger.error('getDraftMails Error', e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Post(':mailid/send')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Send Mail',
    description: '',
  })
  @ApiResponse({ status: 201, description: 'Sent Mail successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async sendtMail(
    @Param('mailid', ParseIntPipe) mailid: number,
    @Body() sendMailDto: SendMailDto,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailService.sendEmail(mailid, sendMailDto, req.user);

      return res.status(HttpStatus.OK).end();
    } catch (e) {
      this.logger.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Get('sent')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Ftech Sent Mail List',
    description: '',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiResponse({ status: 200, description: 'Sent Email Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSentMails(
    @Req() req,
    @Res() res,
    @Query('page', ParseIntPipe) page?: number,
    @Query('perPage', ParseIntPipe) perPage?: number,
  ): Promise<PaginatedMailsDto> {
    try {
      const sendMailsRes = await this.mailService.fetchMailList(
        req.user.userId,
        UserRole.SENDER,
        UserFolder.SENT,
        page,
        perPage,
      );

      return res.status(HttpStatus.OK).json(sendMailsRes).end();
    } catch (e) {
      this.logger.error('getDraftMails Error', e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Get('inbox')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Ftech Inbox Mail List',
    description: '',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiResponse({ status: 200, description: 'Inbox Email Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getInboxMails(
    @Req() req,
    @Res() res,
    @Query('page', ParseIntPipe) page?: number,
    @Query('perPage', ParseIntPipe) perPage?: number,
  ): Promise<PaginatedMailsDto> {
    try {
      const inboxMailsRes = await this.mailService.fetchMailList(
        req.user.userId,
        UserRole.RECEIPENT,
        UserFolder.INBOX,
        page,
        perPage,
      );

      return res.status(HttpStatus.OK).json(inboxMailsRes).end();
    } catch (e) {
      this.logger.error('getDraftMails Error', e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Delete('')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Move mails to trash folder',
    description: '',
  })
  @ApiResponse({ status: 201, description: 'Trash Email Saved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async trashMail(
    @Body() mailIds: MailIds,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      const { ids } = mailIds;
      await this.mailService.moveToTrash(req.user.userId, ids);

      return res.status(HttpStatus.OK).end();
    } catch (e) {
      this.logger.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Get('trash')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Ftech Trash Mail List',
    description: '',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiResponse({ status: 200, description: 'trash mails Fetched successfully' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTrashMails(
    @Req() req,
    @Res() res,
    @Query('page', ParseIntPipe) page?: number,
    @Query('perPage', ParseIntPipe) perPage?: number,
  ): Promise<PaginatedMailsDto> {
    try {
      const trashMailsRes = await this.mailService.fetchTrashMailList(
        req.user.userId,
        page,
        perPage,
      );

      return res.status(HttpStatus.OK).json(trashMailsRes).end();
    } catch (e) {
      this.logger.error('getDraftMails Error', e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Put('startUnstar')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Star/Unstar Mails',
    description: '',
  })
  @ApiResponse({ status: 201, description: 'Star/Unstar Email successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async startUnstarMail(
    @Body() starUnstarBody: StarUnstarBody,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      const { ids, isStar } = starUnstarBody;
      await this.mailService.startUnstarMails(req.user.userId, ids, isStar);

      return res.status(HttpStatus.OK).end();
    } catch (e) {
      this.logger.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Put('markAsRead')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mark Mails as read',
    description: '',
  })
  @ApiResponse({ status: 201, description: 'Marked read Email successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async MarkMailAsRead(
    @Body() mailIds: MailIds,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      const { ids } = mailIds;
      await this.mailService.markAsRead(req.user.userId, ids);

      return res.status(HttpStatus.OK).end();
    } catch (e) {
      this.logger.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }

  @Put('markAllAsRead')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mark All Mails as read',
    description: '',
  })
  @ApiResponse({ status: 201, description: 'Marked read all Email successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async MarkAllMailAsRead(
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailService.markAllAsRead(req.user.userId);

      return res.status(HttpStatus.OK).end();
    } catch (e) {
      this.logger.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(e);
    }
  }
}
