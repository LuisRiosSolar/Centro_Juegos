import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserAccess } from "@/lib/auth-access";

export default async function PerfilPage() {
	const access = await getCurrentUserAccess();

	if (!access.ok) {
		redirect("/login");
	}

	return (
		<main className="min-h-svh bg-[#fff8ed] px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="mx-auto max-w-3xl">
				<Card className="border-white/70 bg-white/85 shadow-xl shadow-amber-950/10 dark:border-white/10 dark:bg-zinc-950/70">
					<CardHeader>
						<CardTitle className="text-3xl">Perfil</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/80">
							<div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-purple-500 text-lg font-bold text-white">
								{access.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{access.name}</p>
								<p>{access.email}</p>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
								<p className="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Rol</p>
								<p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{access.role}</p>
							</div>
							<div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
								<p className="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Estado</p>
								<p className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-300">Activo</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
