import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type AdminAccess =
	| { ok: true; userId: string; name: string; email: string; roleName: string }
	| { ok: false; reason: "unauthenticated" | "forbidden" };

export async function getAdminAccess(): Promise<AdminAccess> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { ok: false, reason: "unauthenticated" };
	}

	const role = session.user.role?.toLowerCase();

	if (role !== "admin" && role !== "superadmin") {
		return { ok: false, reason: "forbidden" };
	}

	return {
		ok: true,
		userId: session.user.id,
		name: session.user.name,
		email: session.user.email,
		roleName: role,
	};
}
