import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NhanKhauService } from './nhan-khau.service';
import { CreateNhanKhauDto } from './dto/create-nhan-khau.dto';
import { UpdateNhanKhauDto } from './dto/update-nhan-khau.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Nhân khẩu')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nhan-khau')
export class NhanKhauController {
  constructor(private readonly nhanKhauService: NhanKhauService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm nhân khẩu mới' })
  @ApiBody({
    schema: {
      example: {
        hoTen: 'duong tuan nguyen',
        biDanh: 'nguyen tuan duong',
        ngaySinh: '2005-05-09T03:44:08.942Z',
        noiSinh: 'Cao Bang',
        queQuan: 'Bac Linh',
        danToc: 'Tay',
        ngheNghiep: 'Suc vat',
        noiLamViec: 'Dai Hoc Back Khao',
        soDinhDanh: {
          loai: 'CMND',
          so: '12312312313',
          ngayCap: '2025-12-25T03:44:08.942Z',
          noiCap: 'Binh Nguyen Vo tan',
        },
        gioiTinh: 'Nữ',
        tonGiao: 'Không',
        quocTich: 'Viet Nam',
        diaChiHienTai: {
          soNha: '12',
          duong: 'nguyen duong',
          phuongXa: 'Nhat ban',
          quanHuyen: '2',
          tinhThanh: 'Thanh Pho',
        },
        diaChiThuongTru: {
          soNha: '12',
          duong: 'nguyen duong',
          phuongXa: 'Nhat ban',
          quanHuyen: '2',
          tinhThanh: 'Thanh Pho',
        },
        diaChiCu: {
          soNha: '12',
          duong: 'nguyen duong',
          phuongXa: 'Nhat ban',
          quanHuyen: '2',
          tinhThanh: 'Thanh Pho',
        },
        hoKhauId: '691d9631baac1efb7579cf0c',
        trangThai: 'Thường trú',
        ngayDangKyThuongTru: '2025-12-25T03:44:08.943Z',
        ghiChu: '',
      },
    },
  })
  create(@Body() createNhanKhauDto: CreateNhanKhauDto) {
    return this.nhanKhauService.create(createNhanKhauDto);
  }
  @Post('them-nhieu')
  themnhieu(@Body() createNhanKhauDto: CreateNhanKhauDto[]) {
    return this.nhanKhauService.themNhieu(createNhanKhauDto);
  }

  @Post('moi-sinh')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.CAN_BO)
  @ApiOperation({ summary: 'Thêm nhân khẩu mới sinh' })
  @ApiBody({
    schema: {
      example: {
        hoTen: 'Nguyễn Tuan Duong',
        ngaySinh: '2025-12-01T08:15:30.000Z',
        gioiTinh: 'Nam',
        hoKhauId: '691d9631baac1efb7579cf0c',
        quanHeVoiChuHo: 'Con',
      },
    },
  })
  themMoiSinh(
    @Body()
    data: {
      hoTen: string;
      ngaySinh: Date;
      gioiTinh: string;
      hoKhauId: string;
      quanHeVoiChuHo: string;
    },
    @Request() req,
  ) {
    return this.nhanKhauService.themMoiSinh({
      ...data,
      nguoiThucHien: req.user.username,
    });
  }

  @Patch(':id/chuyen-di')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.CAN_BO)
  @ApiOperation({ summary: 'Đánh dấu nhân khẩu chuyển đi' })
  @ApiBody({
    schema: {
      example: {
        ngayChuyenDi: '2025-12-20T09:30:00.000Z',
        noiChuyenDen: 'Quận 1, TP. Hồ Chí Minh',
        lyDoChuyenDi: 'Chuyển công tác',
      },
    },
  })
  chuyenDi(
    @Param('id') id: string,
    @Body()
    data: {
      ngayChuyenDi: Date;
      noiChuyenDen: string;
      lyDoChuyenDi?: string;
    },
    @Request() req,
  ) {
    return this.nhanKhauService.chuyenDi(id, {
      ...data,
      nguoiThucHien: req.user.username,
    });
  }

  @Patch(':id/qua-doi')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.CAN_BO)
  @ApiOperation({ summary: 'Đánh dấu nhân khẩu qua đời' })
  @ApiBody({
    schema: {
      example: {
        ngayMat: '2025-12-18T22:10:00.000Z',
      },
    },
  })
  quaDoi(
    @Param('id') id: string,
    @Body() data: { ngayMat: Date },
    @Request() req,
  ) {
    return this.nhanKhauService.quaDoi(id, {
      ngayMat: data.ngayMat,
      nguoiThucHien: req.user.username,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhân khẩu' })
  @ApiQuery({ name: 'hoKhauId', required: false })
  @ApiQuery({ name: 'trangThai', required: false })
  @ApiQuery({ name: 'gioiTinh', required: false })
  findAll(
    @Query('hoKhauId') hoKhauId?: string,
    @Query('trangThai') trangThai?: string,
    @Query('gioiTinh') gioiTinh?: string,
  ) {
    return this.nhanKhauService.findAll({ hoKhauId, trangThai, gioiTinh });
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm nhân khẩu' })
  @ApiQuery({ name: 'keyword', required: true })
  search(@Query('keyword') keyword: string) {
    return this.nhanKhauService.search(keyword);
  }

  @Get('thong-ke/gioi-tinh')
  @ApiOperation({ summary: 'Thống kê nhân khẩu theo giới tính' })
  thongKeTheoGioiTinh() {
    return this.nhanKhauService.thongKeTheoGioiTinh();
  }

  @Get('thong-ke/do-tuoi')
  @ApiOperation({ summary: 'Thống kê nhân khẩu theo độ tuổi' })
  thongKeTheoDoTuoi() {
    return this.nhanKhauService.thongKeTheoDoTuoi();
  }

  @Get('thong-ke/tong-quan')
  @ApiOperation({ summary: 'Thống kê tổng quan nhân khẩu' })
  thongKeTongQuan() {
    return this.nhanKhauService.thongKeTongQuan();
  }

  @Get('thong-ke/tuoi-trung-binh')
  @ApiOperation({ summary: 'Tính tuổi trung bình của nhân khẩu' })
  tinhTuoiTrungBinh() {
    return this.nhanKhauService.tinhTuoiTrungBinh();
  }

  @Get('ho-khau/:hoKhauId')
  @ApiOperation({ summary: 'Lấy danh sách nhân khẩu theo hộ khẩu' })
  findByHoKhau(@Param('hoKhauId') hoKhauId: string) {
    return this.nhanKhauService.findByHoKhau(hoKhauId);
  }

  @Get('ho-khau/:hoKhauId/count')
  @ApiOperation({ summary: 'Đếm số nhân khẩu trong hộ khẩu' })
  demNhanKhau(@Param('hoKhauId') hoKhauId: string) {
    return this.nhanKhauService.demNhanKhauTheoHoKhau(hoKhauId);
  }

  @Get('cccd/:cccd')
  @ApiOperation({ summary: 'Tìm nhân khẩu theo CCCD' })
  findByCCCD(@Param('cccd') cccd: string) {
    return this.nhanKhauService.findByCCCD(cccd);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết nhân khẩu' })
  findOne(@Param('id') id: string) {
    return this.nhanKhauService.findOne(id);
  }

  @Get(':id/lich-su')
  @ApiOperation({ summary: 'Lấy lịch sử thay đổi của nhân khẩu' })
  getLichSu(@Param('id') id: string) {
    return this.nhanKhauService.getLichSuThayDoi(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhân khẩu' })
  @ApiBody({
    schema: {
      example: {
        ngheNghiep: 'Kỹ sư phần mềm',
        noiLamViec: 'Đại học Bách Khoa',
        trangThai: 'Thường trú',
        ghiChu: 'Cập nhật thông tin nghề nghiệp',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateNhanKhauDto: UpdateNhanKhauDto,
    @Request() req,
  ) {
    return this.nhanKhauService.update(
      id,
      updateNhanKhauDto,
      req.user.username,
    );
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa nhân khẩu' })
  remove(@Param('id') id: string) {
    return this.nhanKhauService.remove(id);
  }
  @Get('thong-ke/chung')
async getThongKe() {
  return this.nhanKhauService.getThongKe();
}
}

