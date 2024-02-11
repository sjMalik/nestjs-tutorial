import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
} from 'class-validator';
import {
  UserFolder,
  UserStatus,
  UserRole,
} from 'src/typeorm/mailbox_users.entity';

export class MailboxUserDto {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsBoolean()
  star: boolean;

  @IsEnum(UserFolder)
  folder: UserFolder;

  @IsDate()
  createdAt: Date;
}
