import { PartialType } from '@nestjs/mapped-types';
import { CreateNhanKhauDto } from './create-nhan-khau.dto';

export class UpdateNhanKhauDto extends PartialType(CreateNhanKhauDto) {}
