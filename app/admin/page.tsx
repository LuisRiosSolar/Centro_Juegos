import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSessionForm } from "@/components/admin-session-form";
import { AdminUserForm } from "@/components/admin-user-form";
import { SessionCountdownCard } from "@/components/session-countdown-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { getAdminAccess } from "@/lib/admin-auth";
import { getActiveSessionsOverview } from "@/lib/session-queries";

export async function AdminDashboard() {
	const access = await getAdminAccess();

	if (!access.ok && access.reason === "unauthenticated") {
		redirect("/login");
	}

	if (!access.ok) {
		return (
			<main className="flex min-h-svh items-center justify-center bg-[#fff8ed] px-6 dark:bg-zinc-950">
				<Card className="max-w-md border-white/70 bg-white/90 text-center shadow-xl dark:border-white/10 dark:bg-zinc-950/80">
					<CardHeader>
						<CardTitle>Acceso restringido</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<p>Tu usuario no tiene rol administrador.</p>
						<p>
							El acceso se valida con tu sesión actual y el rol guardado en la
							base de datos.
						</p>
						<Link
							className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
							href="/"
						>
							Volver al inicio
						</Link>
					</CardContent>
				</Card>
			</main>
		);
	}

	const activeSessions = (await getActiveSessionsOverview()).map((session) => ({
		...session,
		fechaIngreso: session.fechaIngreso.toISOString(),
	}));

	return (
		<main className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(247,216,158,0.45),_transparent_28%),linear-gradient(180deg,#f7f1e7_0%,#f3eae5_100%)] px-4 py-6 text-zinc-950 md:px-6 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_12px_30px_rgba(84,58,31,0.08)] backdrop-blur-md md:flex-row md:items-center md:justify-between">
					<div className="flex min-w-0 flex-1 items-center gap-4">
						<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a56f7] via-[#c36be4] to-[#f5b2d5] shadow-lg shadow-violet-500/20">
							<Image
								className="size-10 rounded-xl object-cover"
								src="/logo.jpg"
								alt="Logo de El Rincón de José"
								width={40}
								height={40}
								priority
							/>
						</div>
						<div className="min-w-0">
							<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-300">
								Panel admin
							</p>
							<h1 className="truncate text-2xl font-black tracking-tight md:text-3xl">
								El Rincón de José
							</h1>
							<p className="text-sm text-zinc-600">
								Hola, {access.name}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-end gap-3">
						<div className="inline-flex items-center gap-2 rounded-full bg-[#f4d89d] px-4 py-2 text-sm font-bold text-[#4e3c13] shadow-sm">
							<span className="inline-flex size-2 rounded-full bg-[#5cc5d3]" />
							{activeSessions.length} sesiones activas
						</div>
						<UserProfileMenu
							name={access.name}
							email={access.email}
							role={access.role}
						/>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-3">
					<SummaryCard
						label="Sesiones activas"
						value={activeSessions.length.toString()}
						accent="amber"
					/>
					<SummaryCard
						label="Minutos vendidos"
						value={activeSessions
							.reduce((total, session) => total + session.minutosTotales, 0)
							.toString()}
						accent="violet"
					/>
					<SummaryCard
						label="Caja activa"
						value={`$${activeSessions
							.reduce((total, session) => total + Number(session.precio), 0)
							.toLocaleString("es-CO")}`}
						accent="cyan"
					/>
				</section>

				<div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
					<div className="space-y-6">
						<AdminSessionForm />
						{access.isRoot ? <AdminUserForm /> : null}
					</div>

					<section className="space-y-4">
						<div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/70 p-4 shadow-[0_10px_25px_rgba(80,62,34,0.05)] backdrop-blur-sm">
							<div>
								<h2 className="text-2xl font-black tracking-tight text-zinc-900">
									Sesiones actuales
								</h2>
							</div>
							<div className="rounded-full bg-[#dffaf7] px-3 py-1.5 text-xs font-bold text-[#1d5f67]">
								{activeSessions.length} en curso
							</div>
						</div>

						{activeSessions.length === 0 ? (
							<Card className="border-dashed border-white/70 bg-white/55 shadow-[0_8px_20px_rgba(80,62,34,0.04)] dark:border-white/10 dark:bg-zinc-950/70">
								<CardContent className="flex min-h-48 items-center justify-center text-center text-muted-foreground">
									No hay sesiones activas todavía.
								</CardContent>
							</Card>
						) : (
							<div className="grid gap-4">
								{activeSessions.map((session) => (
									<SessionCountdownCard key={session.id} session={session} />
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}

export default async function AdminPage() {
	return <AdminDashboard />;
}

function SummaryCard({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent: "amber" | "violet" | "cyan";
}) {
	const palette = {
		amber: "bg-[#f6e7c6] text-[#3b2b10]",
		violet: "bg-[#eae0ff] text-[#34265d]",
		cyan: "bg-[#dffaf7] text-[#144a56]",
	};

	return (
		<Card className={`border-white/70 ${palette[accent]} shadow-[0_10px_22px_rgba(72,52,24,0.06)] backdrop-blur dark:border-white/10 dark:bg-zinc-950/70`}>
			<CardContent className="p-5">
				<p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{label}</p>
				<p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
			</CardContent>
		</Card>
	);
}
