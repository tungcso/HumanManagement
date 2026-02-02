import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NhanKhauService } from './nhan-khau.service';
import { NhanKhauController } from './nhan-khau.controller';
import { NhanKhau, NhanKhauSchema } from './schemas/nhan-khau.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NhanKhau.name, schema: NhanKhauSchema },
    ]),
  ],
  controllers: [NhanKhauController],
  providers: [NhanKhauService],
  exports: [NhanKhauService],
})
export class NhanKhauModule {}
