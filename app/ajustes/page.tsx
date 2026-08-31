import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserAccess } from "@/lib/auth-access";

export default async function AjustesPage() {
	const access = await getCurrentUserAccess();

	if (!access.ok) {
		redirect("/login");
	}

	return (
		<main className="min-h-svh bg-[#fff8ed] px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="mx-auto max-w-3xl">
				<Card className="border-white/70 bg-white/85 shadow-xl shadow-amber-950/10 dark:border-white/10 dark:bg-zinc-950/70">
					<CardHeader>
						<CardTitle className="text-3xl">Ajustes</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
							<p className="font-medium text-zinc-900 dark:text-zinc-50">Configuración general</p>
							<p className="mt-2">Aquí puedes personalizar el comportamiento del panel cuando se active la administración completa del sistema.</p>
						</div>
						<div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
							<p className="text-xs uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Usuario</p>
							<p className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">{access.name}</p>
							<p>{access.email}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
