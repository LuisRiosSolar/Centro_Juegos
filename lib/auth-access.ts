import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type AppRole = "admin" | "superadmin";

export type CurrentUserAccess =
	| {
			ok: true;
			userId: string;
			name: string;
			email: string;
			role: AppRole;
			isAdmin: boolean;
			isRoot: boolean;
	  }
	| { ok: false; reason: "unauthenticated" | "forbidden" };

export function normalizeRole(role?: string | null): AppRole {
	const normalized = role?.trim().toLowerCase();

	if (normalized === "superadmin") {
		return "superadmin";
	}

	return "admin";
}

export function isAdminRole(role?: string | null): boolean {
	const normalizedRole = normalizeRole(role);
	return normalizedRole === "admin" || normalizedRole === "superadmin";
}

export async function getCurrentUserAccess(): Promise<CurrentUserAccess> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return { ok: false, reason: "unauthenticated" };
	}

	const role = normalizeRole(session.user.role);

	return {
		ok: true,
		userId: session.user.id,
		name: session.user.name,
		email: session.user.email,
		role,
		isAdmin: true,
		isRoot: role === "superadmin",
	};
}
