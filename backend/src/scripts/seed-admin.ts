import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

// Load environment (use .env.development by default like other scripts)
dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });

const mongoURI = process.env.MONGODB_URI ?? '';

if (!mongoURI) {
  console.error(
    'MONGODB_URI không được thiết lập. Hãy kiểm tra file .env.development',
  );
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    hoTen: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: String,
    isActive: Boolean,
    soDienThoai: String,
    soDinhDanh: Object,
  },
  { timestamps: true },
);

const UserModel = mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('⏳ Kết nối tới MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Đã kết nối.');

    const username = 'admin';
    const email = 'admin@example.com';
    const plainPassword = 'Admin@12345';

    // Kiểm tra nếu đã tồn tại
    const existing = await UserModel.findOne({
      $or: [{ username }, { email }],
    }).exec();
    if (existing) {
      console.log(
        '⚠️ Tài khoản admin đã tồn tại:',
        existing.username || existing.email,
      );
      await mongoose.disconnect();
      return;
    }

    const hashed = await bcrypt.hash(plainPassword, 10);

    const admin = new UserModel({
      hoTen: 'Quản Trị Viên',
      username,
      email,
      password: hashed,
      role: 'to_truong',
      isActive: true,
      soDienThoai: '0123456789',
      soDinhDanh: {
        loai: 'CCCD',
        so: '000000000',
        ngayCap: new Date('2016-01-01'),
        noiCap: 'Hanoi',
      },
    });

    await admin.save();
    console.log('🎉 Tạo tài khoản admin thành công.');
    console.log('Username:', username);
    console.log('Password:', plainPassword);
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Ngắt kết nối MongoDB.');
  }
}

seedAdmin();
