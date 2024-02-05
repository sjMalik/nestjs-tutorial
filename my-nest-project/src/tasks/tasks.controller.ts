import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './tasks.model';
import { ApiOperation } from '@nestjs/swagger';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Fetch Task List', description: 'Fetch the list of the tasks' })
  @Get()
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @ApiOperation({ summary: 'Fetch Task', description: 'Fetch a task by providing id' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a Task', description: 'Create task by providing title & description' })
  @Post()
  async create(@Body() task: Task): Promise<Task> {
    return this.tasksService.create(task);
  }

  @ApiOperation({ summary: 'Update a Task', description: 'Update title & description of task' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() task: Task): Promise<Task> {
    return this.tasksService.update(id, task);
  }

  @ApiOperation({ summary: 'Delete a Task', description: 'Update title & description of task' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Task> {
    return this.tasksService.remove(id);
  }
}
