import {
  IsNotEmpty,
  IsString,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsMongoId,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiaChi } from 'src/ho-khau/dto/create-ho-khau.dto';

export class SoDinhDanh {
  @IsIn(['CMND', 'CCCD'])
  loai: 'CMND' | 'CCCD';

  @IsString()
  so: string;

  @IsDateString()
  ngayCap: Date;

  @IsString()
  noiCap: string;
}
export class CreateNhanKhauDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  hoTen: string;

  @IsOptional()
  @IsString()
  biDanh: string;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh phải là định dạng ngày hợp lệ' })
  ngaySinh: Date;

  @IsNotEmpty({ message: 'Nơi sinh không được để trống' })
  @IsString()
  noiSinh: string;
  @IsNotEmpty({ message: 'Quê quán không được để trống' })
  @IsString()
  queQuan: string;
  @IsNotEmpty({ message: 'Dân tộc không được để trống' })
  @IsString()
  danToc: string;
  @IsOptional()
  @IsString()
  ngheNghiep?: string;

  @IsOptional()
  @IsString()
  noiLamViec?: string;

  @IsNotEmpty({ message: 'Số CCCD không được để trống' })
  @ValidateNested()
  @Type(() => SoDinhDanh)
  soDinhDanh: SoDinhDanh;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsString()
  @IsIn(['Nam', 'Nữ', 'Khác'], {
    message: 'Giới tính phải là Nam, Nữ hoặc Khác',
  })
  gioiTinh: string;

  @IsOptional()
  @IsString()
  tonGiao?: string;

  @IsOptional()
  @IsString()
  quocTich?: string;

  @IsNotEmpty({ message: 'Địa chỉ hiện tại không được để trống' })
  @ValidateNested()
  @Type(() => DiaChi)
  diaChiHienTai: DiaChi;

  @IsNotEmpty({ message: 'Địa chỉ thường trú không được để trống' })
  @ValidateNested()
  @Type(() => DiaChi)
  diaChiThuongTru: DiaChi;

  @ValidateNested()
  @Type(() => DiaChi)
  diaChiCu: DiaChi;

  @IsOptional()
  @IsMongoId({ message: 'hoKhauId phải là MongoDB ObjectId hợp lệ' })
  hoKhauId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Thường trú', 'Tạm trú', 'Tạm vắng', 'Đã chuyển đi', 'Đã Xóa', 'Đã qua đời'], {
    message:
      'Trạng thái phải là: Thường trú, Tạm trú, Tạm vắng, Đã qua đời, hoặc Đã chuyển đi',
  })
  trangThai?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày đăng ký thường trú phải là định dạng ngày hợp lệ' },
  )
  ngayDangKyThuongTru?: Date;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}
