import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mail } from './mail.entity';

export enum UserRole {
  SENDER = 'SENDER',
  RECEIPENT = 'RECEIPENT',
}

export enum UserStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
  COMMITED = 'COMMITED',
}

export enum UserFolder {
  DARFT = 'DRAFT',
  INBOX = 'INBOX',
  SENT = 'SENT',
  TRASH = 'TRASH',
  ARCHIVED = 'ARCHIVED',
}

@Entity()
export class MailUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mail)
  @JoinColumn()
  mail: Mail;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column({ enum: UserRole })
  role: string;

  @Column({ enum: UserStatus, default: UserStatus.UNREAD })
  status: string;

  @Column({ enum: UserFolder })
  folder: string;

  @Column({ default: false })
  star: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
