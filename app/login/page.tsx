import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUserAccess } from "@/lib/auth-access";

export default async function LoginPage() {
	const access = await getCurrentUserAccess();

	if (access.ok) {
		if (access.isRoot || access.isAdmin) {
			redirect("/admin");
		}
		redirect("/sesiones");
	}

	return (
		<main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
			<section className="relative mx-auto flex w-full max-w-md items-center justify-center">
				<LoginForm className="w-full" />
			</section>
		</main>
	);
}
