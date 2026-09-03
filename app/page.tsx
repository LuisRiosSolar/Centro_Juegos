import { redirect } from "next/navigation";
import { getCurrentUserAccess } from "@/lib/auth-access";

export default async function Home() {
	const access = await getCurrentUserAccess();

	if (!access.ok) {
		redirect("/login");
	}

	if (access.isRoot || access.isAdmin) {
		redirect("/admin");
	}

	redirect("/sesiones");
}
