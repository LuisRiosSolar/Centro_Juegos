import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/app/admin/page";
import { SessionCountdownCard } from "@/components/session-countdown-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { getCurrentUserAccess } from "@/lib/auth-access";
import { getSessionsByCreatorId } from "@/lib/session-queries";

export default async function SessionsPage() {
	const access = await getCurrentUserAccess();

	if (!access.ok) {
		redirect("/login");
	}

	if (access.isAdmin) {
		return <AdminDashboard />;
	}

	const mySessions = (await getSessionsByCreatorId(access.userId)).map((session) => ({
		...session,
		fechaIngreso: session.fechaIngreso.toISOString(),
	}));

	return (
		<main className="min-h-svh bg-[#fff8ed] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
				<header className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-amber-950/10 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div className="min-w-0">
							<p className="text-sm uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
								Mis sesiones
							</p>
							<h1 className="mt-2 truncate text-3xl font-semibold tracking-tight">
								Hola, {access.name}
							</h1>
						</div>
						<div className="flex flex-wrap items-center justify-end gap-3">
							<div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
								{mySessions.length} sesiones creadas
							</div>
							<UserProfileMenu
								name={access.name}
								email={access.email}
								role={access.role}
							/>
						</div>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-3">
					<SummaryCard
						label="Activas"
						value={mySessions.length.toString()}
					/>
					<SummaryCard
						label="Minutos"
						value={mySessions
							.reduce((total, session) => total + session.minutosTotales, 0)
							.toString()}
					/>
					<SummaryCard
						label="Total"
						value={`$${mySessions
							.reduce((total, session) => total + Number(session.precio), 0)
							.toLocaleString("es-CO")}`}
					/>
				</section>

				{mySessions.length === 0 ? (
					<Card className="border-dashed border-white/70 bg-white/70 dark:border-white/10 dark:bg-zinc-950/70">
						<CardHeader>
							<CardTitle>Sin sesiones aún</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-muted-foreground">
							<p>Aún no has creado sesiones. Cuando el administrador asigne la carga, aparecerán aquí.</p>
							<Link
								className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
								href="/"
							>
								Volver al inicio
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{mySessions.map((session) => (
							<SessionCountdownCard key={session.id} session={session} />
						))}
					</div>
				)}
			</div>
		</main>
	);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
	return (
		<Card className="border-white/70 bg-white/85 shadow-lg shadow-amber-950/5 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
			<CardContent className="p-5">
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
			</CardContent>
		</Card>
	);
}
