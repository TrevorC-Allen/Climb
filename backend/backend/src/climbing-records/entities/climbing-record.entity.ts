import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

export type ClimbingType = 'boulder' | 'lead' | 'top-rope';
export type ClimbingGrade = 'VB' | 'V0' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7' | 'V8' | 'V9' | 'V10' | '5.10a' | '5.10b' | '5.10c' | '5.10d' | '5.11a' | '5.11b' | '5.11c' | '5.11d' | '5.12a' | '5.12b' | '5.12c' | '5.12d' | '5.13a' | '5.13b' | '5.13c' | '5.13d' | '5.14a' | '5.14b' | '5.14c' | '5.14d' | '5.15a' | '5.15b' | '5.15c' | '5.15d';

@Entity('climbing_records')
export class ClimbingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.climbing_records)
  user: User;

  @Column()
  route_name: string;

  @Column()
  gym: string;

  @Column()
  type: ClimbingType;

  @Column()
  grade: ClimbingGrade;

  @Column({ nullable: true })
  attempts: number;

  @Column({ default: false })
  first_try: boolean;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  created_at: Date;
}
