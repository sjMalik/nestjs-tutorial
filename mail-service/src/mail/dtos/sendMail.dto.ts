import {
  IsOptional,
  IsNumber,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsString,
  IsEmail,
  IsJSON,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SendMailDto {
  @IsOptional()
  @IsNumber()
  parentId: number;

  @IsOptional()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsJSON()
  attachments: any;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Receiver)
  receivers: Receiver[];
}

export class Receiver {
  @IsNumber()
  userId: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
