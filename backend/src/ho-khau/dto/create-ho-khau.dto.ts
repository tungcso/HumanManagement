import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChuHoDto {
  @IsOptional()
  @IsMongoId({ message: 'Cai nay phai la dang MongoDB' })
  nhanKhauId?: string;

  @IsNotEmpty({ message: 'Họ tên chủ hộ không được để trống' })
  @IsString()
  hoTen: string;
}

export class DiaChi {
  @IsOptional()
  @IsString()
  soNha?: string;

  @IsOptional()
  @IsString()
  duong?: string;

  @IsOptional()
  @IsString()
  phuongXa?: string;

  @IsOptional()
  @IsString()
  quanHuyen?: string;

  @IsOptional()
  @IsString()
  tinhThanh: string;
}

export class ThanhVien {
  @IsMongoId({ message: 'nhanKhauId must be a valid MongoDB ObjectId' })
  nhanKhauId: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  hoTen: string;
  @IsNotEmpty({ message: 'Quan hệ với chủ hộ không được để trống' })
  @IsString()
  quanHeVoiChuHo: string;
}

export class GhiChu {
  @IsOptional()
  @IsString()
  noiDung?: string;

  @IsDateString({}, { message: 'Phải là 1 date string' })
  @Type(() => Date)
  capNhat: Date;
}

export class CreateHoKhauDto {
  @IsNotEmpty({ message: 'Thông tin chủ hộ không được để trống' })
  chuHo: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested()
  @Type(() => DiaChi)
  diaChi: DiaChi;

  @IsOptional()
  @IsString()
  trangThai?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThanhVien)
  thanhVien?: ThanhVien[];

  @IsOptional()
  ghiChu?: string;
}
