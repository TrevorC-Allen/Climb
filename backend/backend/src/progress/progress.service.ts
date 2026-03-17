import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClimbingRecord } from '../climbing-records/entities/climbing-record.entity';

interface ProgressStats {
  total_climbs: number;
  by_type: Record<string, number>;
  by_grade: Record<string, number>;
  first_try_rate: number;
  avg_attempts: number;
}

interface HistoryItem {
  date: string;
  count: number;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ClimbingRecord)
    private readonly recordRepository: Repository<ClimbingRecord>,
  ) {}

  async getStats(userId: string): Promise<ProgressStats> {
    const records = await this.recordRepository.find({ where: { user_id: userId } });

    const byType: Record<string, number> = {};
    const byGrade: Record<string, number> = {};
    let firstTryCount = 0;
    let totalAttempts = 0;

    records.forEach((record) => {
      byType[record.type] = (byType[record.type] || 0) + 1;
      byGrade[record.grade] = (byGrade[record.grade] || 0) + 1;
      if (record.first_try) firstTryCount++;
      totalAttempts += record.attempts || 1;
    });

    return {
      total_climbs: records.length,
      by_type: byType,
      by_grade: byGrade,
      first_try_rate: records.length > 0 ? (firstTryCount / records.length) * 100 : 0,
      avg_attempts: records.length > 0 ? totalAttempts / records.length : 0,
    };
  }

  async getHistory(userId: string): Promise<HistoryItem[]> {
    const rawQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM climbing_records
      WHERE user_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const results = await this.recordRepository.query(rawQuery, [userId]);
    return results.map((row: any) => ({
      date: row.date,
      count: row.count,
    }));
  }
}
