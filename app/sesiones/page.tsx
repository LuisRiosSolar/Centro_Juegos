import Image from "next/image";
import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

import { SessionTvCard } from "@/components/session-tv-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAccess } from "@/lib/admin-auth";
import { getActiveGameSessions } from "@/lib/game-sessions";

export default async function SessionsPage() {
	const [activeSessions, adminAccess] = await Promise.all([
		getActiveGameSessions(),
		getAdminAccess(),
	]);

	return (
		<main className="min-h-svh">
			<div className="flex min-h-svh flex-col gap-8 p-8">
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Image
							className="size-20 rounded-2xl object-cover"
							src="/logo.jpg"
							alt="Logo de El Rincón de José"
							width={120}
							height={120}
							priority
						/>
						<div>
							<p className="text-lg uppercase tracking-[0.35em] text-muted-foreground">
								El Rincón de José
							</p>
							<h1 className="text-5xl font-semibold tracking-tight">
								Sesiones activas
							</h1>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{adminAccess.ok ? (
							<Button size="lg" render={<Link href="/admin" />}>
								<LayoutDashboardIcon />
								Administrar
							</Button>
						) : null}
						<p className="text-6xl font-semibold tabular-nums">
							{activeSessions.length}
						</p>
					</div>
				</header>

				{activeSessions.length === 0 ? (
					<Card className="flex flex-1">
						<CardContent className="flex flex-1 items-center justify-center text-center">
							<p className="text-5xl font-semibold tracking-tight text-muted-foreground">
								No hay sesiones activas
							</p>
						</CardContent>
					</Card>
				) : (
					<section className="grid flex-1 auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
						{activeSessions.map((activeSession) => (
							<SessionTvCard key={activeSession.id} session={activeSession} />
						))}
					</section>
				)}
			</div>
		</main>
	);
}
