import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return this.generateToken(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user.id);
  }

  async getProfile(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private generateToken(userId: string) {
    return {
      access_token: this.jwtService.sign({ userId }),
    };
  }
}
