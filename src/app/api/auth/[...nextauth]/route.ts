import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db"; // นำเข้าตัวเชื่อมต่อฐานข้อมูล
import { RowDataPacket } from "mysql2";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
        }

        try {
          // 1. ค้นหาในตารางลูกค้า (customer) ก่อน
          const [customerRows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM customer WHERE email = ?",
            [credentials.email]
          );

          if (customerRows.length > 0) {
            const user = customerRows[0];
            
            // ตรวจสอบรหัสผ่านแบบปกติ (Plain text)  
            if (credentials.password === user.password) {
              return {
                id: user.id.toString(),
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: "customer", 
              };
            } else {
              throw new Error("รหัสผ่านไม่ถูกต้อง");
            }
          }

          // 2. ถ้าไม่เจอลูกค้า 
          const [employeeRows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM employee WHERE email = ?",
            [credentials.email]
          );

          if (employeeRows.length > 0) {
            const emp = employeeRows[0];

            if (credentials.password === emp.password) {
              return {
                id: emp.id.toString(),
                name: `${emp.first_name} ${emp.last_name}`,
                email: emp.email,
                role: emp.role, // แปะป้ายบอกระบบตามตำแหน่ง เช่น admin, manager, staff
              };
            } else {
              throw new Error("รหัสผ่านไม่ถูกต้อง");
            }
          }

          // 3. ถ้าไม่เจอทั้งใน customer และ employees
          throw new Error("ไม่พบข้อมูลผู้ใช้งานในระบบ");

        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    // นำเอา role ที่เราแปะป้ายไว้ ยัดใส่เข้าไปใน Token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    // ถอดรหัส Token ส่งข้อมูลออกมาให้ฝั่งหน้าเว็บ (Frontend) เอาไปใช้งาน
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", // บอก NextAuth ว่าหน้าล็อกอินของเราอยู่ที่นี่
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };