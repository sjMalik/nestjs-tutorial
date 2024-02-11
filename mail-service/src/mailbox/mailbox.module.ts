import { Module } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { MailboxController } from './mailbox.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mailbox } from 'src/typeorm/mailbox.entity';
import { MailboxUsers } from 'src/typeorm/mailbox_users.entity';
import { AuthGuard } from './auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Mailbox, MailboxUsers]),
  ],
  providers: [MailboxService, AuthGuard],
  controllers: [MailboxController],
})
export class MailboxModule {}
