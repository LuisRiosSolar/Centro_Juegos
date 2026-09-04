import Image from "next/image";
import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

import { SessionTvCard } from "@/components/session-tv-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAccess } from "@/lib/admin-auth";
import { getActiveGameSessions } from "@/lib/game-sessions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SessionsPage() {
	const [activeSessions, adminAccess] = await Promise.all([
		getActiveGameSessions(),
		getAdminAccess(),
	]);

	return (
		<main className="min-h-svh bg-background">
			<div className="flex min-h-svh flex-col gap-6 p-4 sm:p-6 lg:p-8">
				{/* ── Header ── */}
				<header
					className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 px-6 py-4 shadow-sm"
					style={{
						background: "var(--sidebar, #1A122E)",
					}}
				>
					<div className="flex items-center gap-4">
						<Image
							className="size-14 sm:size-16 rounded-2xl object-cover ring-2 ring-white/20"
							src="/logo.jpg"
							alt="Logo de El Rincón de José"
							width={100}
							height={100}
							priority
						/>
						<div>
							<p
								className="text-xs font-black uppercase tracking-[0.3em]"
								style={{ color: "var(--brand-orange, #FF6B00)" }}
							>
								El Rincón de José
							</p>
							<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
								Sesiones Activas
							</h1>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="text-right">
							<p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
								En Juego
							</p>
							<p className="text-4xl sm:text-5xl font-black tabular-nums text-white leading-none">
								{activeSessions.length}
							</p>
						</div>

						{adminAccess.ok ? (
							<Button
								size="default"
								nativeButton={false}
								render={<Link href="/admin" />}
								className="gap-2 font-bold shadow-lg"
							>
								<LayoutDashboardIcon className="size-4" />
								Administrar
							</Button>
						) : null}
					</div>
				</header>

				{/* ── Contenido de Sesiones ── */}
				{activeSessions.length === 0 ? (
					<Card className="flex flex-1 items-center justify-center border-dashed border-2 py-16">
						<CardContent className="flex flex-col items-center justify-center text-center">
							<span className="text-6xl sm:text-7xl mb-4">🎮</span>
							<p className="text-2xl sm:text-3xl font-black tracking-tight text-muted-foreground">
								No hay sesiones activas en este momento
							</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Las tarjetas de los niños jugando aparecerán aquí en tiempo real.
							</p>
						</CardContent>
					</Card>
				) : (
					<section className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 items-stretch">
						{activeSessions.map((activeSession, idx) => (
							<SessionTvCard
								key={activeSession.id}
								session={activeSession}
								paletteIndex={idx}
							/>
						))}
					</section>
				)}
			</div>
		</main>
	);
}
