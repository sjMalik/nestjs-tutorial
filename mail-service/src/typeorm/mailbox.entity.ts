// mailbox.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MailboxUsers } from './mailbox_users.entity';

@Entity()
export class Mailbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  message: string;

  @Column('json', { nullable: true })
  messageProps: any;

  @Column('json', { nullable: true })
  attachments: any;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => MailboxUsers, (mailboxUsers) => mailboxUsers.mail)
  mailboxUsers: MailboxUsers[]; // Define the relation with MailboxUsers
}
