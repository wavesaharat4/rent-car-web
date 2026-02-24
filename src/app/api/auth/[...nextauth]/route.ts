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
          // 1. ค้นหาในตารางลูกค้า (เปลี่ยน email เป็น cusMail)
          const [customerRows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM customer WHERE cusMail = ?",
            [credentials.email]
          );

          if (customerRows.length > 0) {
            const user = customerRows[0];
            
            // ตรวจสอบรหัสผ่าน (เปลี่ยน password เป็น cusPass)
            if (credentials.password === user.cusPass) {
              return {
                id: user.cusID.toString(), // เปลี่ยน id เป็น cusID
                name: `${user.cusFN} ${user.cusLN}`, // เปลี่ยนชื่อ-สกุล
                email: user.cusMail, // เปลี่ยน email
                role: "CUSTOMER", 
              };
            } else {
              throw new Error("รหัสผ่านไม่ถูกต้อง");
            }
          }

          // 2. ถ้าไม่เจอลูกค้า ให้หาในตารางพนักงาน (เปลี่ยน email เป็น empMail)
          const [employeeRows] = await db.query<RowDataPacket[]>(
            "SELECT * FROM employee WHERE empMail = ?",
            [credentials.email]
          );

          if (employeeRows.length > 0) {
            const emp = employeeRows[0];

            // ตรวจสอบรหัสผ่าน (เปลี่ยน password เป็น empPass)
            if (credentials.password === emp.empPass) {
              return {
                id: emp.empID.toString(), // เปลี่ยน id เป็น empID
                name: `${emp.empFN} ${emp.empLN}`, // เปลี่ยนชื่อ-สกุล
                email: emp.empMail, // เปลี่ยน email
                role: emp.empRole.toUpperCase(), // เปลี่ยน role เป็น empRole
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
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