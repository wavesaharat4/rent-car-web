// ไฟล์: app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. ค้นหาผู้ใช้งานจาก Database
        const [rows]: any = await pool.execute(
          'SELECT * FROM users WHERE email = ?',
          [credentials.email]
        );
        const user = rows[0];

        if (!user) return null; // ไม่พบอีเมล

        // 2. เทียบรหัสผ่านที่กรอกมากับใน Database
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) return null; // รหัสผ่านผิด

        // 3. ส่งข้อมูลกลับไปทำ Session
        return { 
          id: user.id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      },
    }),
  ],
  pages: {
    signIn: "/login", // กำหนดว่าหน้า Login ของเราอยู่ที่ไหน
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };