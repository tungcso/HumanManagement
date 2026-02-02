import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HoKhauModule } from './ho-khau/ho-khau.module';
import { KhoanThuModule } from './khoan-thu/khoan-thu.module';
import { NhanKhauModule } from './nhan-khau/nhan-khau.module';
import { TamTruTamVangModule } from './tam-tru-tam-vang/tam-tru-tam-vang.module';
import { ThuPhiModule } from './thu-phi/thu-phi.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (cf: ConfigService) => {
        return {
          uri: cf.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    NhanKhauModule,
    HoKhauModule,
    TamTruTamVangModule,
    KhoanThuModule,
    ThuPhiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
