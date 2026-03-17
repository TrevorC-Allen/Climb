import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:orderId')
  getOrderByOrderId(@Request() req, @Param('orderId') orderId: string) {
    return this.paymentsService.getByOrderId(req.user.userId, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyPayments(@Request() req) {
    return this.paymentsService.getMyPayments(req.user.userId);
  }
}
