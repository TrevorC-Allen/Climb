import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(userId: string, dto: CreatePaymentDto) {
    const orderId = `PAY_${uuidv4().substring(0, 12).toUpperCase()}`;
    
    const payment = this.paymentRepository.create({
      user_id: userId,
      order_id: orderId,
      amount: dto.amount,
      currency: 'CNY',
      type: dto.type,
      description: dto.description,
      status: 'pending',
    });

    await this.paymentRepository.save(payment);

    return {
      order_id: orderId,
      amount: dto.amount,
      status: 'pending',
      message: '请在微信小程序中完成支付',
    };
  }

  async getByOrderId(userId: string, orderId: string) {
    return this.paymentRepository.findOne({
      where: { order_id: orderId, user_id: userId },
    });
  }

  async getMyPayments(userId: string) {
    return this.paymentRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async verifyPayment(orderId: string, transactionId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { order_id: orderId },
    });

    if (!payment) {
      throw new BadRequestException('Order not found');
    }

    payment.status = 'paid';
    payment.transaction_id = transactionId;
    payment.paid_at = new Date();

    return this.paymentRepository.save(payment);
  }
}
