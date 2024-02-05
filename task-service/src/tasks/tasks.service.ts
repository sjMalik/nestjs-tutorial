import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './tasks.model';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  // Retrive all tasks from the DB
  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  // Retrive a single task by its id
  async findOne(id: string): Promise<Task> {
    return this.taskModel.findById(id).exec();
  }

  // Create a new task in DB
  async create(task: Task): Promise<Task> {
    const newTask = new this.taskModel(task);
    return newTask.save();
  }

  // Update a task by its id
  async update(id: string, task: Task): Promise<Task> {
    return this.taskModel.findByIdAndUpdate(id, task, { new: true }).exec();
  }

  // Remove a task by its id
  async remove(id: string): Promise<Task> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }
}
