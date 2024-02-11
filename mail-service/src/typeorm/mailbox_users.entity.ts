// mailbox-users.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mailbox } from './mailbox.entity';

export enum UserRole {
  SENDER = 'SENDER',
  RECIPIENT = 'RECIPIENT',
}

export enum UserStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
  COMMITTED = 'COMMITTED',
}

export enum UserFolder {
  DRAFT = 'DRAFT',
  INBOX = 'INBOX',
  SENT = 'SENT',
  TRASH = 'TRASH',
  ARCHIVED = 'ARCHIVED',
}

@Entity()
export class MailboxUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mailbox)
  @JoinColumn()
  mail: Mailbox;

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

  @Column({ default: false })
  star: boolean;

  @Column({ enum: UserFolder })
  folder: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
