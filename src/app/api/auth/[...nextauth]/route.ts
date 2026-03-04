import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
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
          // 1. ค้นหาในตารางลูกค้า
          const [customerRows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM customer WHERE cusMail = ?",
            [credentials.email]
          );

          if (customerRows.length > 0) {
            const user = customerRows[0];

            if (user.cusStatus !== 'active') {
              // ถ้าโดนแบน 
              throw new Error("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
            }
            // ตรวจสอบรหัสผ่าน
            if (credentials.password === user.cusPass) {
              return {
                id: user.cusID.toString(),
                name: `${user.cusFN} ${user.cusLN}`,
                email: user.cusMail,
                role: "CUSTOMER",
              };
            } else {
              throw new Error("รหัสผ่านไม่ถูกต้อง");
            }
          }

          // 2. ถ้าไม่เจอลูกค้า ให้หาในตารางพนักงาน
          const [employeeRows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM employee WHERE empMail = ?",
            [credentials.email]
          );

          if (employeeRows.length > 0) {
            const emp = employeeRows[0];

            // ตรวจสอบรหัสผ่าน
            if (credentials.password === emp.empPass) {
              return {
                id: emp.empID.toString(),
                name: `${emp.empFN} ${emp.empLN}`,
                email: emp.empMail,
                role: emp.empRole.toUpperCase(),
              };
            } else {
              throw new Error("รหัสผ่านไม่ถูกต้อง");
            }
          }

          // 3. ถ้าไม่เจอทั้งคู่
          throw new Error("ไม่พบข้อมูลผู้ใช้งานในระบบ");

        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    // 1. จัดการ Token
    async jwt({ token, user, trigger, session }) {
      // ถ้าเป็นการ Login ครั้งแรก
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role
      }
      // 📌 ถ้ามีการสั่ง update() จากหน้า Profile ให้เอาชื่อใหม่มาทับ
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },

    // 2. ส่ง Token ไปให้ Session (เพื่อให้ Navbar เอาไปใช้)
    async session({ session, token }) {
      if (token) {
        // 📌 เพิ่มบรรทัดนี้เพื่อป้องกัน Error 'undefined'
        session.user = session.user || {};

        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.name = token.name;

        session.user.role = token.role;
      }
      return session;
    }
  }, // ✅ ปีกกาปิด callbacks ที่ถูกต้อง
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };