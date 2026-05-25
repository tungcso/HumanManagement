import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { fakerVI as faker } from '@faker-js/faker';

dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });

const mongoURI = process.env.MONGODB_URI ?? '';
if (!mongoURI) {
  console.error(
    'MONGODB_URI không được thiết lập. Hãy kiểm tra file .env.development',
  );
  process.exit(1);
}

// Minimal schemas matching project models (only fields we need for seeding)
const UserSchema = new mongoose.Schema({
  hoTen: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean,
});

const NhanKhauSchema = new mongoose.Schema({
  hoTen: String,
  ngaySinh: Date,
  gioiTinh: String,
  diaChiHienTai: Object,
  diaChiThuongTru: Object,
  soDinhDanh: Object,
  trangThai: String,
});

const HoKhauSchema = new mongoose.Schema({
  chuHo: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanKhau' },
  diaChi: Object,
  thanhVien: [
    {
      nhanKhauId: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanKhau' },
      hoTen: String,
      quanHeVoiChuHo: String,
    },
  ],
});

const TamTruSchema = new mongoose.Schema({
  nhanKhauId: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanKhau' },
  hoTen: String,
  loai: String,
  tuNgay: Date,
  denNgay: Date,
  diaChiTamTru: Object,
  trangThai: String,
});

const KhoanThuSchema = new mongoose.Schema({
  tenKhoanThu: String,
  loaiKhoanThu: String,
  soTien: Number,
  ngayBatDau: Date,
  isActive: Boolean,
});

const ThuPhiSchema = new mongoose.Schema({
  maPhieuThu: { type: String, unique: true },
  hoKhauId: { type: mongoose.Schema.Types.ObjectId, ref: 'HoKhau' },
  tenChuHo: String,
  diaChi: String,
  soNhanKhau: Number,
  chiTietThu: Array,
  tongTien: Number,
  ngayThu: Date,
  nguoiThu: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nam: Number,
  kyThu: String,
});

const UserModel = mongoose.model('User', UserSchema);
const NhanKhauModel = mongoose.model('NhanKhau', NhanKhauSchema);
const HoKhauModel = mongoose.model('HoKhau', HoKhauSchema);
const TamTruModel = mongoose.model('TamTruTamVang', TamTruSchema);
const KhoanThuModel = mongoose.model('KhoanThu', KhoanThuSchema);
const ThuPhiModel = mongoose.model('ThuPhi', ThuPhiSchema);

async function seedAll() {
  try {
    console.log('⏳ Kết nối tới MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Đã kết nối.');

    // USERS
    const usersCount = await UserModel.countDocuments();
    if (usersCount === 0) {
      console.log('Đang tạo users mẫu...');
      const users = [
        {
          hoTen: 'Quản Trị Viên',
          username: 'admin',
          email: 'admin@example.com',
          password: await bcrypt.hash('Admin@12345', 10),
          role: 'to_truong',
          isActive: true,
        },
        {
          hoTen: 'Phó Tổ',
          username: 'topho',
          email: 'topho@example.com',
          password: await bcrypt.hash('ToPho@123', 10),
          role: 'to_pho',
          isActive: true,
        },
        {
          hoTen: 'Kế Toán',
          username: 'ketoan',
          email: 'ketoan@example.com',
          password: await bcrypt.hash('KeToan@123', 10),
          role: 'ke_toan',
          isActive: true,
        },
        {
          hoTen: 'Cán Bộ',
          username: 'canbo',
          email: 'canbo@example.com',
          password: await bcrypt.hash('CanBo@123', 10),
          role: 'can_bo',
          isActive: true,
        },
      ];
      await UserModel.insertMany(users);
      console.log('🎉 Đã tạo users mẫu.');
    } else {
      console.log('Users đã tồn tại, bỏ qua tạo mới.');
    }

    // NHÂN KHẨU
    const nhanKhauCount = await NhanKhauModel.countDocuments();
    let nhanKhauDocs: any[] = [];
    if (nhanKhauCount === 0) {
      console.log('Đang tạo nhân khẩu mẫu...');
      const n = 20;
      for (let i = 0; i < n; i++) {
        const hoTen = faker.person.fullName();
        const gender = faker.person.sexType() === 'male' ? 'Nam' : 'Nữ';
        const nk = {
          hoTen,
          ngaySinh: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
          gioiTinh: gender,
          diaChiHienTai: {
            soNha: faker.location.buildingNumber(),
            duong: faker.location.street(),
            phuongXa: 'Phường ' + faker.location.city(),
            quanHuyen: faker.location.city(),
            tinhThanh: 'Hà Nội',
          },
          soDinhDanh: {
            loai: 'CCCD',
            so: faker.string.numeric(12),
            ngayCap: new Date('2018-01-01'),
            noiCap: 'Hanoi',
          },
          trangThai: 'Thường trú',
        };
        nhanKhauDocs.push(nk);
      }
      nhanKhauDocs = await NhanKhauModel.insertMany(nhanKhauDocs);
      console.log('🎉 Đã tạo nhân khẩu mẫu:', nhanKhauDocs.length);
    } else {
      nhanKhauDocs = await NhanKhauModel.find().limit(20).exec();
      console.log('Nhan khau đã tồn tại, sử dụng dữ liệu hiện có.');
    }

    // HỘ KHẨU
    const hoKhauCount = await HoKhauModel.countDocuments();
    let hoKhauDocs: any[] = [];
    if (hoKhauCount === 0) {
      console.log('Đang tạo hộ khẩu mẫu...');
      // create 5 households, each with 3-5 members
      for (let i = 0; i < 5; i++) {
        const members: {
          nhanKhauId: any;
          hoTen: string;
          quanHeVoiChuHo: string;
        }[] = [];
        const memberCount = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < memberCount; j++) {
          const person = nhanKhauDocs[(i * 3 + j) % nhanKhauDocs.length];
          members.push({
            nhanKhauId: person._id,
            hoTen: person.hoTen,
            quanHeVoiChuHo: j === 0 ? 'Chủ hộ' : 'Thành viên',
          });
        }
        const chuHoId = members[0].nhanKhauId;
        const hk = {
          chuHo: chuHoId,
          diaChi: {
            soNha: faker.location.buildingNumber(),
            duong: faker.location.street(),
            phuongXa: 'Phường ' + faker.location.city(),
            quanHuyen: faker.location.city(),
            tinhThanh: 'Hà Nội',
          },
          thanhVien: members,
        };
        const created = await HoKhauModel.create(hk);
        hoKhauDocs.push(created);
      }
      console.log('🎉 Đã tạo hộ khẩu mẫu:', hoKhauDocs.length);
    } else {
      hoKhauDocs = await HoKhauModel.find().limit(5).exec();
      console.log('Ho khau đã tồn tại, sử dụng dữ liệu hiện có.');
    }

    // KHOẢN THU
    const khoanThuCount = await KhoanThuModel.countDocuments();
    let khoanThuDocs: any[] = [];
    if (khoanThuCount === 0) {
      console.log('Đang tạo khoản thu mẫu...');
      const kt = [
        {
          tenKhoanThu: 'Quỹ Tổ Dân Phố',
          loaiKhoanThu: 'Tự nguyện',
          soTien: 100000,
          ngayBatDau: new Date(),
          isActive: true,
        },
        {
          tenKhoanThu: 'Phí Vệ Sinh',
          loaiKhoanThu: 'Bắt buộc',
          soTien: 20000,
          ngayBatDau: new Date(),
          isActive: true,
        },
      ];
      khoanThuDocs = await KhoanThuModel.insertMany(kt);
      console.log('🎉 Đã tạo khoản thu mẫu:', khoanThuDocs.length);
    } else {
      khoanThuDocs = await KhoanThuModel.find().limit(5).exec();
      console.log('Khoan thu đã tồn tại, sử dụng dữ liệu hiện có.');
    }

    // THU PHÍ
    const thuPhiCount = await ThuPhiModel.countDocuments();
    if (thuPhiCount === 0) {
      console.log('Đang tạo thu phí mẫu...');
      for (let i = 0; i < hoKhauDocs.length; i++) {
        const ho = hoKhauDocs[i];
        const ma = 'TP' + faker.string.numeric(6);
        const chiTiet = khoanThuDocs.map((k: any) => ({
          khoanThuId: k._id,
          tenKhoanThu: k.tenKhoanThu,
          soTien: k.soTien,
        }));
        const total = chiTiet.reduce(
          (s: number, it: any) => s + (it.soTien || 0),
          0,
        );
        await ThuPhiModel.create({
          maPhieuThu: ma,
          hoKhauId: ho._id,
          tenChuHo: ho.thanhVien[0].hoTen,
          diaChi: `${ho.diaChi.soNha} ${ho.diaChi.duong}, ${ho.diaChi.phuongXa}`,
          soNhanKhau: ho.thanhVien.length,
          chiTietThu: chiTiet,
          tongTien: total,
          ngayThu: new Date(),
          nguoiThu: null,
          nam: new Date().getFullYear(),
          kyThu: 'Tháng 5',
        });
      }
      console.log('🎉 Đã tạo thu phí cho hộ khẩu mẫu.');
    } else {
      console.log('Thu phí đã tồn tại, bỏ qua.');
    }

    // TAM TRU / TAM VANG
    const tamTruCount = await TamTruModel.countDocuments();
    if (tamTruCount === 0) {
      console.log('Đang tạo tam tru/tam vang mẫu...');
      for (let i = 0; i < 5; i++) {
        const person = nhanKhauDocs[i];
        await TamTruModel.create({
          nhanKhauId: person._id,
          hoTen: person.hoTen,
          loai: i % 2 === 0 ? 'Tạm trú' : 'Tạm vắng',
          tuNgay: new Date(),
          denNgay: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          diaChiTamTru: person.diaChiHienTai,
          trangThai: 'Đang hiệu lực',
        });
      }
      console.log('🎉 Đã tạo tam tru/tam vang mẫu.');
    } else {
      console.log('Tam tru/tam vang đã tồn tại, bỏ qua.');
    }

    console.log('✨ Seed hoàn tất.');
  } catch (error) {
    console.error('❌ Lỗi khi seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Ngắt kết nối.');
  }
}

void seedAll();
