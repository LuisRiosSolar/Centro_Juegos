import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminCreateSessionDialog } from "@/components/admin-create-session-dialog";
import { AdminSessionList } from "@/components/admin-session-list";
import { AdminSidebar } from "@/components/admin-sidebar";
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
	getAdminGameSessions,
	getSessionMetrics,
} from "@/lib/game-sessions";

export async function AdminDashboard() {
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

	const [activeSessions, plans, sessions] = await Promise.all([
		getActiveGameSessions(),
		getActivePlans(),
		getAdminGameSessions(),
	]);
	const metrics = getSessionMetrics(activeSessions);
	const nextEndingSession = getNextEndingSession(activeSessions);

	return (
		<SidebarProvider>
			<AdminSidebar
				userName={access.name}
				userEmail={access.email}
				isRoot={access.isRoot}
				active="panel"
			/>
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

						<section
							aria-label="Resumen de sesiones activas"
							className="grid grid-cols-2 gap-2 lg:grid-cols-4"
						>
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

						<AdminSessionList sessions={sessions} />
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

export default async function AdminPage() {
	return <AdminDashboard />;
}

function SummaryCard({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<Card className="border-border/70 shadow-none">
			<CardContent className="flex min-w-0 items-baseline justify-between gap-2 px-3 py-2.5">
				<p className="truncate text-xs text-muted-foreground">{label}</p>
				<p className="shrink-0 text-lg font-semibold tracking-tight tabular-nums">
					{value}
				</p>
			</CardContent>
		</Card>
	);
}

function getNextEndingSession(
	sessions: Awaited<ReturnType<typeof getActiveGameSessions>>,
) {
	return sessions
		.filter((session) => getEndTimestamp(session) > Date.now())
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
		timeZone: "America/Bogota",
	}).format(new Date(getEndTimestamp(session)));
}
