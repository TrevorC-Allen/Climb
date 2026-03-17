import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClimbingRecordsController } from './climbing-records.controller';
import { ClimbingRecordsService } from './climbing-records.service';
import { ClimbingRecord } from './entities/climbing-record.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClimbingRecord]),
    UsersModule,
  ],
  controllers: [ClimbingRecordsController],
  providers: [ClimbingRecordsService],
  exports: [ClimbingRecordsService],
})
export class ClimbingRecordsModule {}
