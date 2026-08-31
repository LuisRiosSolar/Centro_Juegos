import { getCurrentUserAccess } from "@/lib/auth-access";

export type AdminAccess =
	| {
			ok: true;
			userId: string;
			name: string;
			email: string;
			roleName: string;
			isRoot: boolean;
	  }
	| { ok: false; reason: "unauthenticated" | "forbidden" };

export async function getAdminAccess(): Promise<AdminAccess> {
	const access = await getCurrentUserAccess();

	if (!access.ok) {
		return { ok: false, reason: access.reason };
	}

	if (!access.isAdmin) {
		return { ok: false, reason: "forbidden" };
	}

	return {
		ok: true,
		userId: access.userId,
		name: access.name,
		email: access.email,
		roleName: access.role,
		isRoot: access.isRoot,
	};
}
