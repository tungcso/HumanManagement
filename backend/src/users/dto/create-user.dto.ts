import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../schemas/user.schema';
import { SoDinhDanh } from 'src/nhan-khau/dto/create-nhan-khau.dto';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  hoTen: string;

  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  @MinLength(4, { message: 'Username phải có ít nhất 4 ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SoDinhDanh)
  soDinhDanh: SoDinhDanh;
}
