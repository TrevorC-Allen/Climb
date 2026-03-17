import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClimbingRecordsModule } from './climbing-records/climbing-records.module';
import { ProgressModule } from './progress/progress.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ClimbingRecordsModule,
    ProgressModule,
    PaymentsModule,
  ],
})
export class AppModule {}
