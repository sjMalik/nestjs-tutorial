import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Task extends Document {
  @ApiProperty({ example: 'Task Title', description: 'The title of the task' })
  @Prop()
  title: string;

  @ApiProperty({
    example: false,
    description: 'Indicate whether task completed or not',
  })
  @Prop({ default: false })
  completed: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
