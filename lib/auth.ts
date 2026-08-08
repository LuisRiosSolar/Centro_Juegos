import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";


export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg"}),
  baseURL: "http://localhost:3000/",
  emailAndPassword: { enabled: true },
});
