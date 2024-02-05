import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from 'src/users/dtos/loginuser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user entity with the hashed password
    const newUser = this.userRepository.create({
      ...rest,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  getUsers() {
    return this.userRepository.find();
  }

  findUsersById(id: number) {
    // Use FindOneOptions to specify conditions, relations, etc.
    const options: FindOneOptions<Users> = { where: { id } };
    return this.userRepository.findOne(options);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Users | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Passwords match
      return user;
    }

    return null;
  }

  async loginUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateJwtToken(user.email, user.id, `${user.firstName} ${user.lastName}`);

    return { token };
  }

  private generateJwtToken(email: string, userId: number, name: string): string {
    const payload = { email, userId, name };
    const secret = 'your-secret-key'; // Replace with your actual secret key
    const options = { expiresIn: '1h' }; // Adjust the expiration time as needed

    return jwt.sign(payload, secret, options);
  }
}
