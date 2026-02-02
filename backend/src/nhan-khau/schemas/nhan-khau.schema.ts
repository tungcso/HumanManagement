import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { SoDinhDanh } from '../dto/create-nhan-khau.dto';
import { DiaChi } from 'src/ho-khau/dto/create-ho-khau.dto';

export type NhanKhauDocument = NhanKhau & Document;

export class LichSuThayDoi {
  noiDung: string;
  ngayThayDoi: Date;
  nguoiThucHien: string;
}

@Schema({ timestamps: true })
export class NhanKhau {
  @Prop({ required: true })
  hoTen: string;

  @Prop()
  biDanh: string;

  @Prop({ required: true })
  ngaySinh: Date;

  @Prop()
  noiSinh: string;

  @Prop()
  queQuan: string;

  @Prop()
  danToc: string;

  @Prop()
  ngheNghiep: string;

  @Prop()
  noiLamViec: string;

  @Prop({
    type: SoDinhDanh,
  })
  soDinhDanh: SoDinhDanh;

  @Prop({ required: true })
  gioiTinh: string;

  @Prop({ default: 'Không' })
  tonGiao: string;

  @Prop({ required: true, default: 'Việt Nam' })
  quocTich: string;

  @Prop({
    type: DiaChi,
  })
  diaChiHienTai: DiaChi;

  @Prop({
    type: DiaChi,
  })
  diaChiThuongTru: DiaChi;

  @Prop({
    type: DiaChi,
  })
  diaChiCu: DiaChi;

  @Prop({
    type: String,
    enum: ['Thường trú', 'Tạm trú', 'Tạm vắng', 'Đã chuyển đi', 'Đã qua đời'],
    default: 'Thường trú',
  })
  trangThai: string;

  @Prop({ type: Types.ObjectId, ref: 'HoKhau' })
  hoKhauId: Types.ObjectId;

  @Prop({ type: Date })
  ngayDangKyThuongTru: Date;

  // Thông tin chuyển đi
  @Prop({ type: Date })
  ngayChuyenDi: Date;

  @Prop()
  noiChuyenDen: string;

  @Prop()
  lyDoChuyenDi: string;

  // Thông tin nếu mới sinh
  @Prop({ default: false })
  moiSinh: boolean;

  // Ghi chú
  @Prop()
  ghiChu: string;

  // Lịch sử thay đổi
  @Prop({ type: [LichSuThayDoi], default: [] })
  lichSuThayDoi: LichSuThayDoi[];

  // Quan hệ với chủ hộ
  @Prop()
  quanHeVoiChuHo: string;
}

export const NhanKhauSchema = SchemaFactory.createForClass(NhanKhau);
