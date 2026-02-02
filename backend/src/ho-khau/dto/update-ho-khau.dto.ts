import { PartialType } from '@nestjs/mapped-types';
import { CreateHoKhauDto } from './create-ho-khau.dto';

export class UpdateHoKhauDto extends PartialType(CreateHoKhauDto) {}
