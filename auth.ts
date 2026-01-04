import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // 1. Check if user exists
        const checkUser = await pool.query("SELECT id FROM user_settings WHERE email = $1", [user.email]);

        if (checkUser.rows.length === 0) {
          // 2. New User? Insert them.
          // IMPORTANT: We only insert email, first_name, and last_name. 
          // We removed 'full_name' from the schema, so we must not use it here.
          const firstName = user.name?.split(" ")[0] || "User";
          const lastName = user.name?.split(" ").slice(1).join(" ") || ""; // Handle multi-word last names

          await pool.query(
            `INSERT INTO user_settings (email, first_name, last_name) 
             VALUES ($1, $2, $3)`,
            [user.email, firstName, lastName]
          );
        }
        return true;
      } catch (error) {
        console.error("Login Error in auth.ts:", error);
        return false; // This triggers the AccessDenied error
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        // Attach DB ID to session
        const dbUser = await pool.query("SELECT id FROM user_settings WHERE email = $1", [session.user.email]);
        if (dbUser.rows.length > 0) {
          // @ts-ignore
          session.user.id = dbUser.rows[0].id;
        }
      }
      return session;
    }
  }
})