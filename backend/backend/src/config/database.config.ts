import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', () => ({
  type: 'sqlite',
  database: process.env.DATABASE_URL || 'sqlite.db',
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
})) as unknown as TypeOrmModuleOptions;
