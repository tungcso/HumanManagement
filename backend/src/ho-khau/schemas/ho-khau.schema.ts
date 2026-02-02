import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChuHoDto, DiaChi } from '../dto/create-ho-khau.dto';

export type HoKhauDocument = HoKhau & Document;

export class LichSuThayDoiHoKhau {
  noiDung: string;
  ngayThayDoi: Date;
  nguoiThucHien: string;
}
class ThanhVien {
  @Prop({ type: Types.ObjectId, ref: 'NhanKhau' })
  nhanKhauId: Types.ObjectId;
  @Prop({ required: true })
  hoTen: string;
  @Prop({ required: true })
  quanHeVoiChuHo: string;
}

@Schema({ timestamps: true })
export class HoKhau {
  @Prop({
    type: Types.ObjectId,
    ref: 'NhanKhau',
  })
  chuHo: Types.ObjectId;

  @Prop({
    type: DiaChi,
    required: true,
  })
  diaChi: DiaChi;

  @Prop({
    type: [
      {
        nhanKhauId: {
          type: Types.ObjectId,
          ref: 'NhanKhau',
          required: true,
        },
        hoTen: {
          type: String,
          required: true,
        },
        quanHeVoiChuHo: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  })
  thanhVien: ThanhVien[];
  @Prop({
    type: String,
    enum: ['Đang hoạt động', 'Đã tách hộ', 'Đã xóa'],
    default: 'Đang hoạt động',
  })
  trangThai: string;

  @Prop({ type: Date })
  ngayLap: Date;

  @Prop()
  ghiChu: string;

  // Lịch sử thay đổi hộ khẩu (thay đổi chủ hộ, tách hộ, ...)
  @Prop({ type: [LichSuThayDoiHoKhau], default: [] })
  lichSuThayDoi: LichSuThayDoiHoKhau[];
}

export const HoKhauSchema = SchemaFactory.createForClass(HoKhau);
