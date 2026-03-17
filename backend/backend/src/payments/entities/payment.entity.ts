import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentType = 'gym_ticket' | 'membership' | 'coaching';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @Column()
  order_id: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  type: PaymentType;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: PaymentStatus;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;
}
