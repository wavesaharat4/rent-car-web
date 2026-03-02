import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;

const parsePort = (value?: string | null) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 3306;
};

const dbConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || dbUrl?.hostname || 'localhost',
  port: parsePort(process.env.DB_PORT || process.env.MYSQLPORT || dbUrl?.port),
  user:
    process.env.DB_USER ||
    process.env.MYSQLUSER ||
    (dbUrl?.username ? decodeURIComponent(dbUrl.username) : 'root'),
  password:
    process.env.DB_PASSWORD ||
    process.env.MYSQLPASSWORD ||
    (dbUrl?.password ? decodeURIComponent(dbUrl.password) : ''),
  database:
    process.env.DB_NAME ||
    process.env.MYSQLDATABASE ||
    (dbUrl?.pathname ? dbUrl.pathname.replace(/^\//, '') : undefined),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,  // 10 วินาที timeout สำหรับ Railway DB ที่ช้า
};

console.log(`Connecting to database: ${dbConfig.database} at ${dbConfig.host}`);

const globalForMySQL = global as unknown as { mysqlPool: mysql.Pool };

export const db = globalForMySQL.mysqlPool || mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForMySQL.mysqlPool = db;
}
