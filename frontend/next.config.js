/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // THÊM DÒNG NÀY: Bắt buộc để Render tìm thấy thư mục 'out'
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
