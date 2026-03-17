import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ClimbingRecord } from '../climbing-records/entities/climbing-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClimbingRecord]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
