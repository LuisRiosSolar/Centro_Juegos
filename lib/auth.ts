import { db } from "@/db";
import { rol, schema, user } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

type Auth = ReturnType<typeof betterAuth>;

let authInstance: Auth | undefined;

function getAuth(): Auth {
	if (!authInstance) {
		authInstance = betterAuth({
			database: drizzleAdapter(db, { provider: "pg", schema }),
			baseURL: process.env.BETTER_AUTH_URL,
			emailAndPassword: {
				enabled: true,
				autoSignIn: false,
				disableSignUp: true,
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
	}
	return authInstance;
}

// Avoid initializing Better Auth (and its database adapter) during next build.
export const auth = new Proxy({} as Auth, {
	get(_target, property) {
		const instance = getAuth();
		return Reflect.get(instance, property, instance);
	},
});
