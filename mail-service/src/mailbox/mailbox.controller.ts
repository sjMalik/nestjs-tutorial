// mailbox.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { CreateDraftMailDto } from './dtos/createDraftMail.dto';
import { AuthGuard } from './auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendMailDto } from './dtos/sendMail.dto';
import { UserFolder, UserRole } from 'src/typeorm/mailbox_users.entity';
import { PaginatedMailsDto } from './dtos/paginatedMail.dto';
import { MailIds, StartUnstarBody } from './dtos/mailbox.dto';

@Controller('mailbox')
@ApiBearerAuth()
export class MailboxController {
  constructor(private readonly mailboxService: MailboxService) { }

  @ApiOperation({
    summary: 'Create Draft Email',
    description: 'Create Draft Email',
  })
  @ApiResponse({ status: 201, description: 'Draft Email Saved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Post()
  async createDraftMail(
    @Body() createMailboxDto: CreateDraftMailDto,
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      const mailId = await this.mailboxService.createDraftMail(
        createMailboxDto,
        req.user,
      );
      return res.status(HttpStatus.OK).json({ mailId }).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  @ApiOperation({
    summary: 'Get Draft Email List',
    description: 'Get Draft Email List',
  })
  @ApiResponse({ status: 200, description: 'List Fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Get('')
  async getDraftMails(
    @Query('page', ParseIntPipe) page: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Req() req,
    @Res() res,
  ): Promise<PaginatedMailsDto> {
    try {
      const draftMailObj = await this.mailboxService.fetchInboxOrSentMails(
        req.user.userId,
        page,
        perPage,
        UserRole.SENDER,
        UserFolder.DRAFT,
      );
      return res.status(HttpStatus.OK).json(draftMailObj).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  @ApiOperation({
    summary: 'Mark mails as read',
    description: 'Mark mails as read',
  })
  @ApiResponse({ status: 200, description: 'Read Mails successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Post('markasread')
  async markAsRead(
    @Req() req,
    @Body() mailIds: MailIds,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailboxService.markAsRead(req.user.userId, mailIds.ids);
      return res.status(HttpStatus.OK).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err?.message);
    }
  }

  @ApiOperation({
    summary: 'Mark all mails as read',
    description: 'Mark all mails as read',
  })
  @ApiResponse({ status: 200, description: 'Read all Mails successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Post('markallasread')
  async markAllAsRead(
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailboxService.markAllAsRead(req.user.userId);
      return res.status(HttpStatus.OK).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err?.message);
    }
  }

  @ApiOperation({
    summary: 'Send Email',
    description: 'Send Email',
  })
  @ApiResponse({ status: 201, description: 'Email Set successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Post(':mailid/send')
  async sendMail(
    @Req() req,
    @Body() sendMailDto: SendMailDto,
    @Param('mailid', ParseIntPipe) mailid: number,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailboxService.sendEmail(mailid, sendMailDto, req.user);
      return res.status(HttpStatus.OK).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err?.message);
    }
  }

  @ApiOperation({
    summary: 'Move mails to Trash',
    description: 'Move mails to Trash',
  })
  @ApiResponse({ status: 200, description: 'Moving to Trash successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Delete('')
  async trashMails(
    @Req() req,
    @Body() mailIds: MailIds,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailboxService.moveToTrash(req.user.userId, mailIds.ids);
      return res.status(HttpStatus.OK).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err?.message);
    }
  }

  @ApiOperation({
    summary: 'Get Trash Email List',
    description: 'Get Trash Email List',
  })
  @ApiResponse({ status: 200, description: 'List Fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Get('trash')
  async getTrashMails(
    @Query('page', ParseIntPipe) page: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Req() req,
    @Res() res,
  ): Promise<PaginatedMailsDto> {
    try {
      const draftMailObj = await this.mailboxService.fetchTrashMails(
        req.user.userId,
        page,
        perPage,
      );
      return res.status(HttpStatus.OK).json(draftMailObj).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  @ApiOperation({
    summary: 'Get Inbox Email List',
    description: 'Get Inbox Email List',
  })
  @ApiResponse({ status: 200, description: 'Inbox Fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Get('inbox')
  async getInboxMails(
    @Query('page', ParseIntPipe) page: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Req() req,
    @Res() res,
  ): Promise<PaginatedMailsDto> {
    try {
      const inboxMails = await this.mailboxService.fetchInboxOrSentMails(
        req.user.userId,
        page,
        perPage,
        UserRole.RECIPIENT,
        UserFolder.INBOX,
      );
      return res.status(HttpStatus.OK).json(inboxMails).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err?.code);
    }
  }

  @ApiOperation({
    summary: 'Get Sent Email List',
    description: 'Get Sent Email List',
  })
  @ApiResponse({ status: 200, description: 'Sent Emails Fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Get('sent')
  async getSentMails(
    @Query('page', ParseIntPipe) page: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Req() req,
    @Res() res,
  ): Promise<PaginatedMailsDto> {
    try {
      const inboxMails = await this.mailboxService.fetchInboxOrSentMails(
        req.user.userId,
        page,
        perPage,
        UserRole.SENDER,
        UserFolder.SENT,
      );
      return res.status(HttpStatus.OK).json(inboxMails).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.message);
    }
  }

  @ApiOperation({
    summary: 'Start/Unstart Mails',
    description: 'Start/Unstart Mails',
  })
  @ApiResponse({ status: 200, description: 'Start/Unstart Mails successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Delete('')
  async starUnstar(
    @Req() req,
    @Body() startUnstarBody: StartUnstarBody,
    @Res() res,
  ): Promise<void> {
    try {
      await this.mailboxService.startUnstarMail(req.user.userId, startUnstarBody.ids, startUnstarBody.isStar);
      return res.status(HttpStatus.OK).end();
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err?.message);
    }
  }
}
