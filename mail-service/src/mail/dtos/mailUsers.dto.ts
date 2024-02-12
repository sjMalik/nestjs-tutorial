import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
} from 'class-validator';
import { UserFolder, UserRole, UserStatus } from 'src/typeorm/mailUsers.entity';

export class MailUsersDto {
  @IsInt()
  id: number;

  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: string;

  @IsEnum(UserStatus)
  status: string;

  @IsEnum(UserFolder)
  folder: string;

  @IsBoolean()
  star: boolean;

  @IsDate()
  createdAt: Date;
}
