import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.progressService.getStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@Request() req) {
    return this.progressService.getHistory(req.user.userId);
  }
}
