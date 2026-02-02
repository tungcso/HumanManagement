import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoKhauService } from './ho-khau.service';
import { HoKhauController } from './ho-khau.controller';
import { HoKhau, HoKhauSchema } from './schemas/ho-khau.schema';
import {
  NhanKhau,
  NhanKhauSchema,
} from '../nhan-khau/schemas/nhan-khau.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HoKhau.name, schema: HoKhauSchema },
      { name: NhanKhau.name, schema: NhanKhauSchema },
    ]),
  ],
  controllers: [HoKhauController],
  providers: [HoKhauService],
  exports: [HoKhauService],
})
export class HoKhauModule {}
