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
  UseGuards,
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

@Controller('mail')
@ApiBearerAuth()
export class MailController {
  private readonly logger = new Logger('Mail Controller');

  constructor(private readonly mailService: MailService) {}

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
      throw e;
    }
  }

  @Get('')
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
}
