import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClimbingRecord } from '../climbing-records/entities/climbing-record.entity';
import { Payment } from '../payments/entities/payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  total_climbs: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ClimbingRecord, (record) => record.user)
  climbing_records: ClimbingRecord[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
