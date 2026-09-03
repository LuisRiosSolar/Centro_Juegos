"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import type { ActiveSessionCardData } from "@/components/session-countdown-card";
import { cn } from "@/lib/utils";

export function SessionTvCard({ session }: { session: ActiveSessionCardData }) {
	const [now, setNow] = useState(() => Date.now());
	const startedAt = useMemo(
		() => new Date(session.fechaIngreso).getTime(),
		[session.fechaIngreso],
	);
	const endsAt = startedAt + session.minutosTotales * 60_000;
	const totalMs = Math.max(1, endsAt - startedAt);
	const remainingMs = endsAt - now;
	const isFinished = session.estado !== "ACTIVA" || remainingMs <= 0;
	const progress = Math.min(
		100,
		Math.max(0, ((now - startedAt) / totalMs) * 100),
	);

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);

		return () => window.clearInterval(interval);
	}, []);

	return (
		<Card
			className={cn(
				"transition-colors",
				isFinished && "border-destructive/60 bg-destructive/10 opacity-80",
			)}
		>
			<CardContent className="flex h-full flex-col justify-between gap-6 p-8">
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-3">
						<p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
							{session.planNombre}
						</p>
						{isFinished ? (
							<span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
								TERMINADA
							</span>
						) : null}
					</div>
					<h2 className="truncate text-4xl font-semibold tracking-tight">
						{session.clienteNombre}
					</h2>
				</div>

				<div className="space-y-4">
					<p className="font-mono text-7xl font-semibold tracking-tight tabular-nums">
						{formatRemaining(remainingMs)}
					</p>
					<progress className="h-4 w-full" value={progress} max={100} />
				</div>

				<div className="flex items-center justify-between text-lg text-muted-foreground">
					<span>{isFinished ? "Tiempo terminado" : "Tiempo restante"}</span>
					<span>Sale {formatTime(endsAt)}</span>
				</div>
			</CardContent>
		</Card>
	);
}

function formatRemaining(ms: number) {
	if (ms <= 0) return "00:00:00";

	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds]
		.map((value) => value.toString().padStart(2, "0"))
		.join(":");
}

function formatTime(value: number) {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
