import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  attachments: any[];

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
