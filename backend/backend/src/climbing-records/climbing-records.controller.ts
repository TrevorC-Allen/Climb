import { Controller, Post, Body, Get, UseGuards, Request, Query, Param } from '@nestjs/common';
import { ClimbingRecordsService } from './climbing-records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('climbing-records')
export class ClimbingRecordsController {
  constructor(private readonly recordsService: ClimbingRecordsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateRecordDto) {
    return this.recordsService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Request() req, @Query('limit') limit?: number) {
    return this.recordsService.getAll(req.user.userId, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Request() req, @Query('id') id: string) {
    return this.recordsService.getOne(req.user.userId, id);
  }
}
