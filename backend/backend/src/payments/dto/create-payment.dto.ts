import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  type: PaymentType;

  @IsString()
  @IsOptional()
  description?: string;
}
