import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClimbingRecord } from './entities/climbing-record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClimbingRecordsService {
  constructor(
    @InjectRepository(ClimbingRecord)
    private readonly recordRepository: Repository<ClimbingRecord>,
  ) {}

  async create(userId: string, dto: CreateRecordDto) {
    const record = this.recordRepository.create({
      ...dto,
      user_id: userId,
    });
    await this.recordRepository.save(record);
    return record;
  }

  async getAll(userId: string, limit?: number) {
    const query = this.recordRepository
      .createQueryBuilder('record')
      .where('record.user_id = :userId', { userId })
      .orderBy('record.created_at', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async getOne(userId: string, id: string) {
    return this.recordRepository.findOne({
      where: { id, user_id: userId },
    });
  }
}
