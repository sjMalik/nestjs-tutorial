import { IsString, IsEmail, IsNumber } from 'class-validator';

export class DecodedUserDto {
  @IsNumber()
  userId: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}
