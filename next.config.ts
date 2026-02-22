/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // อนุญาตให้ดึงรูปจากเว็บ placeholder นี้
      },
      // ถ้าในอนาคตคุณเอารูปไปฝากไว้ที่อื่น เช่น S3 หรือ Cloudinary ก็มาเพิ่มตรงนี้ครับ
    ],
  },
}

module.exports = nextConfig