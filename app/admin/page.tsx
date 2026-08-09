import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminCreateSessionDialog } from "@/components/admin-create-session-dialog";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SessionCountdownCard } from "@/components/session-countdown-card";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAdminAccess } from "@/lib/admin-auth";
import {
	getActiveGameSessions,
	getActivePlans,
	getSessionMetrics,
} from "@/lib/game-sessions";

export default async function AdminPage() {
	const access = await getAdminAccess();

	if (!access.ok && access.reason === "unauthenticated") redirect("/login");

	if (!access.ok) {
		return (
			<main className="flex min-h-svh items-center justify-center px-6">
				<Card className="max-w-md text-center">
					<CardHeader>
						<CardTitle>Acceso restringido</CardTitle>
						<CardDescription>
							Tu usuario no tiene rol administrador.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							className="text-sm underline-offset-4 hover:underline"
							href="/"
						>
							Volver al inicio
						</Link>
					</CardContent>
				</Card>
			</main>
		);
	}

	const [activeSessions, plans] = await Promise.all([
		getActiveGameSessions(),
		getActivePlans(),
	]);
	const metrics = getSessionMetrics(activeSessions);
	const nextEndingSession = getNextEndingSession(activeSessions);

	return (
		<SidebarProvider>
			<AdminSidebar userName={access.name} active="panel" />
			<SidebarInset>
				<main className="min-h-svh">
					<div className="flex w-full flex-col gap-5 px-4 py-5 lg:px-6">
						<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								<SidebarTrigger />
								<div>
									<p className="text-sm text-muted-foreground">Panel admin</p>
									<h1 className="text-3xl font-semibold tracking-tight">
										Sesiones de juego
									</h1>
								</div>
							</div>
							<AdminCreateSessionDialog plans={plans} />
						</header>

						<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
							<SummaryCard
								label="Activas"
								value={metrics.activeCount.toString()}
							/>
							<SummaryCard
								label="Minutos"
								value={metrics.totalMinutes.toString()}
							/>
							<SummaryCard
								label="Caja activa"
								value={`$${metrics.activeCash.toLocaleString("es-CO")}`}
							/>
							<SummaryCard
								label="Próxima salida"
								value={nextEndingSession ? getEndTime(nextEndingSession) : "—"}
							/>
						</section>

						<section className="space-y-3">
							<div>
								<h2 className="text-xl font-semibold tracking-tight">
									Sesiones en curso
								</h2>
								<p className="text-sm text-muted-foreground">
									Vista compacta para controlar más sesiones sin cambiar de
									pantalla.
								</p>
							</div>
							{activeSessions.length === 0 ? (
								<Card>
									<CardContent className="flex min-h-52 items-center justify-center text-center text-muted-foreground">
										No hay sesiones activas todavía.
									</CardContent>
								</Card>
							) : (
								<div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
									{activeSessions.map((session) => (
										<SessionCountdownCard
											key={session.id}
											session={session}
											canAdjustTime
											compact
										/>
									))}
								</div>
							)}
						</section>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

function SummaryCard({ label, value }: { label: string; value: string }) {
	return (
		<Card>
			<CardContent className="p-4">
				<p className="text-sm text-muted-foreground">{label}</p>
				<p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
			</CardContent>
		</Card>
	);
}

function getNextEndingSession(
	sessions: Awaited<ReturnType<typeof getActiveGameSessions>>,
) {
	return sessions
		.slice()
		.sort((a, b) => getEndTimestamp(a) - getEndTimestamp(b))[0];
}

function getEndTimestamp(
	session: Awaited<ReturnType<typeof getActiveGameSessions>>[number],
) {
	return (
		new Date(session.fechaIngreso).getTime() + session.minutosTotales * 60_000
	);
}

function getEndTime(
	session: Awaited<ReturnType<typeof getActiveGameSessions>>[number],
) {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(getEndTimestamp(session)));
}
