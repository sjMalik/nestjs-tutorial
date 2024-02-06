import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/typeorm/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createuser.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dtos/loginuser.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    // Hash the password
    const hashedPaswword = await bcrypt.hash(password, 10);

    // Create a new user entity with the hashed password
    const newUser = this.userRepository.create({
      ...rest,
      password: hashedPaswword,
    });

    return this.userRepository.save(newUser);
  }

  async findUserById(id: number) {
    // Use FindOneOptions to specify conditions
    const options: FindOneOptions<Users> = { where: { id } };
    return this.userRepository.findOne(options);
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // Generate JWT Token
    const token = this.generateJwtToken(
      email,
      user.id,
      password,
      `${user.firstName} ${user.lastName}`,
    );

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid Credentials: Password not valid',
      );
    }

    return { token };
  }

  private generateJwtToken(
    email: string,
    userId: number,
    password: string,
    name: string,
  ): string {
    const payload = { userId, name, email, password };
    const secret = this.configService.get('SECRET');
    const options = { expiresIn: '1h' };

    return jwt.sign(payload, secret, options);
  }
}
