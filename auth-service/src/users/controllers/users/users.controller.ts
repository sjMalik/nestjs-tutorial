import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { LoginDto } from 'src/users/dtos/loginuser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // @Get()
  // @UseGuards(AuthGuard)
  // @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  // getUsers() {
  //   return this.userService.getUsers();
  // }

  @ApiOperation({ summary: 'Get logged in user details', description: 'Fetch the user details by proving token' })
  @Get(':id')
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AuthGuard)
  findUsersById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUsersById(id);
  }

  @ApiOperation({ summary: 'User Registration', description: 'Register a user by inserting username, email & password' })
  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  createUsers(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'User Login', description: 'Login to the system by providing email & password' })
  @Post('login')
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async login(@Body() loginDto: LoginDto) {
    return this.userService.loginUser(loginDto);
  }
}
