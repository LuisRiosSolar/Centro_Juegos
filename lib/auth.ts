import { db } from "@/db";
import { rol, schema, user } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", schema }),
	baseURL: process.env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
	},
	plugins: [
		customSession(async ({ session, user: sessionUser }) => {
			const [currentUser] = await db
				.select({
					roleId: user.roleId,
					role: rol.nombre,
				})
				.from(user)
				.leftJoin(rol, eq(user.roleId, rol.id))
				.where(eq(user.id, sessionUser.id))
				.limit(1);

			return {
				session,
				user: {
					...sessionUser,
					roleId: currentUser?.roleId ?? null,
					role: currentUser?.role?.toLowerCase() ?? null,
				},
			};
		}),
	],
});
