import mysql from 'mysql2/promise';

// ดึงค่ามาจากไฟล์ .env ที่เราตั้งไว้
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306, 
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway', 
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
};

// ทริคสำคัญสำหรับ Next.js: ป้องกันการสร้าง Connection ซ้ำซ้อนตอนที่ระบบรีเฟรชตัวเอง (Hot Reload)
const globalForMySQL = global as unknown as { mysqlPool: mysql.Pool };

// สร้าง Connection Pool
export const db = globalForMySQL.mysqlPool || mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForMySQL.mysqlPool = db;
}