import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSessionForm } from "@/components/admin-session-form";
import { SessionCountdownCard } from "@/components/session-countdown-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import {
	cliente,
	planTiempo,
	responsable,
	sesionJuego,
	user,
} from "@/db/schema";
import { getAdminAccess } from "@/lib/admin-auth";
import { desc, eq } from "drizzle-orm";

export default async function AdminPage() {
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

	const activeSessions = (
		await db
			.select({
				id: sesionJuego.id,
				fechaIngreso: sesionJuego.fechaIngreso,
				minutosTotales: sesionJuego.minutosTotales,
				clienteNombre: cliente.nombreCompleto,
				clienteIdentificacion: cliente.identificacion,
				responsableNombre: responsable.nombreCompleto,
				responsableTelefono: responsable.telefono,
				planNombre: planTiempo.nombre,
				precio: planTiempo.precio,
				creadoPor: user.name,
			})
			.from(sesionJuego)
			.innerJoin(cliente, eq(sesionJuego.clienteId, cliente.id))
			.innerJoin(responsable, eq(cliente.responsableId, responsable.id))
			.innerJoin(planTiempo, eq(sesionJuego.planTiempoId, planTiempo.id))
			.innerJoin(user, eq(sesionJuego.creadoPor, user.id))
			.where(eq(sesionJuego.estado, "ACTIVA"))
			.orderBy(desc(sesionJuego.fechaIngreso))
	).map((session) => ({
		...session,
		fechaIngreso: session.fechaIngreso.toISOString(),
		precio: session.precio.toString(),
	}));

	return (
		<main className="min-h-svh bg-[#fff8ed] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
				<header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-amber-950/10 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-4">
						<Image
							className="size-16 rounded-2xl object-cover shadow-lg"
							src="/logo.jpg"
							alt="Logo de El Rincón de José"
							width={96}
							height={96}
							priority
						/>
						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">
								Panel admin
							</p>
							<h1 className="text-3xl font-semibold tracking-tight">
								El Rincón de José
							</h1>
							<p className="text-sm text-muted-foreground">
								Hola, {access.name}
							</p>
						</div>
					</div>
					<div className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
						{activeSessions.length} sesiones activas
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-3">
					<SummaryCard
						label="Sesiones activas"
						value={activeSessions.length.toString()}
					/>
					<SummaryCard
						label="Minutos vendidos"
						value={activeSessions
							.reduce((total, session) => total + session.minutosTotales, 0)
							.toString()}
					/>
					<SummaryCard
						label="Caja activa"
						value={`$${activeSessions
							.reduce((total, session) => total + Number(session.precio), 0)
							.toLocaleString("es-CO")}`}
					/>
				</section>

				<div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
					<AdminSessionForm />

					<section className="space-y-4">
						<div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-lg shadow-amber-950/5 backdrop-blur dark:border-white/10 dark:bg-zinc-950/60">
							<h2 className="text-2xl font-semibold tracking-tight">
								Sesiones actuales
							</h2>
							<p className="text-sm text-muted-foreground">
								Cuenta regresiva en vivo para cada jugador activo.
							</p>
						</div>

						{activeSessions.length === 0 ? (
							<Card className="border-dashed border-white/70 bg-white/70 dark:border-white/10 dark:bg-zinc-950/70">
								<CardContent className="flex min-h-52 items-center justify-center text-center text-muted-foreground">
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
