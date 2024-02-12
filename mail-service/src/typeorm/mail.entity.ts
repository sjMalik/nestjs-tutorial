import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MailUsers } from './mailUsers.entity';

@Entity()
export class Mail {
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

  @OneToMany(() => MailUsers, (MailUsers) => MailUsers.mail)
  mailUsers: MailUsers[];
}
