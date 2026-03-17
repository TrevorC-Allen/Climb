import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ClimbingType, ClimbingGrade } from '../entities/climbing-record.entity';

export class CreateRecordDto {
  @IsString()
  route_name: string;

  @IsString()
  gym: string;

  @IsString()
  type: ClimbingType;

  @IsString()
  grade: ClimbingGrade;

  @IsNumber()
  @IsOptional()
  attempts?: number;

  @IsBoolean()
  @IsOptional()
  first_try?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
