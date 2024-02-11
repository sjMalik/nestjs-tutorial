import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createuser.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUserDto } from './dtos/loginuser.dto';
import { AuthGuard } from './auth.guard';

@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @ApiOperation({
    summary: 'User Registration',
    description:
      'Register a user by inserting email, password, fist name, last name',
  })
  @Post('register')
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UsePipes(ValidationPipe)
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @ApiOperation({
    summary: 'Get logged in user details',
    description: 'Fetch the user details by proving token',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AuthGuard)
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  @ApiOperation({
    summary: 'User Login',
    description: 'Login to the system by providing email & password',
  })
  @Post('login')
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }
}
