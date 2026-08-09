"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Gamepad2, Phone, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ActiveSessionCardData = {
	id: string;
	fechaIngreso: string;
	minutosTotales: number;
	clienteNombre: string;
	clienteIdentificacion: string;
	responsableNombre: string;
	responsableTelefono: string;
	planNombre: string;
	precio: string;
	creadoPor: string;
};

type SessionCountdownCardProps = {
	session: ActiveSessionCardData;
};

export function SessionCountdownCard({ session }: SessionCountdownCardProps) {
	const [now, setNow] = useState(() => Date.now());
	const startedAt = useMemo(
		() => new Date(session.fechaIngreso).getTime(),
		[session.fechaIngreso],
	);
	const endsAt = startedAt + session.minutosTotales * 60_000;
	const totalMs = Math.max(1, endsAt - startedAt);
	const remainingMs = endsAt - now;
	const elapsedMs = Math.min(totalMs, Math.max(0, now - startedAt));
	const progress = Math.round((elapsedMs / totalMs) * 100);
	const isExpired = remainingMs <= 0;
	const isAlmostDone = remainingMs > 0 && remainingMs <= 10 * 60_000;

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);

		return () => window.clearInterval(interval);
	}, []);

	return (
		<Card
			className={cn(
				"border-white/70 bg-white/95 shadow-lg shadow-amber-950/5 dark:border-white/10 dark:bg-zinc-950/85",
				isExpired &&
					"border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/20",
				isAlmostDone &&
					"border-amber-300 bg-amber-50/90 dark:border-amber-800/60 dark:bg-amber-950/20",
			)}
		>
			<CardContent className="p-5">
				<div className="flex flex-col gap-5">
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<span
									className={cn(
										"rounded-full px-3 py-1 text-xs font-semibold",
										isExpired
											? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
											: isAlmostDone
												? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
												: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
									)}
								>
									{isExpired
										? "TIEMPO TERMINADO"
										: isAlmostDone
											? "POR TERMINAR"
											: "ACTIVA"}
								</span>
								<span className="text-xs text-muted-foreground">
									Inicio: {formatDateTime(session.fechaIngreso)}
								</span>
							</div>

							<div>
								<h3 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
									<Gamepad2 className="size-5 text-amber-700 dark:text-amber-300" />
									{session.clienteNombre}
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									ID {session.clienteIdentificacion}
								</p>
							</div>

							<div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
								<p className="flex items-center gap-2">
									<UserRound className="size-4" />
									{session.responsableNombre}
								</p>
								<p className="flex items-center gap-2">
									<Phone className="size-4" />
									{session.responsableTelefono}
								</p>
							</div>
						</div>

						<div className="rounded-3xl bg-zinc-950 p-5 text-center text-white shadow-xl shadow-zinc-950/10 dark:bg-white dark:text-zinc-950 md:min-w-64">
							<p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.25em] opacity-70">
								<Clock className="size-4" />
								Cuenta regresiva
							</p>
							<p className="mt-3 font-mono text-4xl font-semibold tracking-tight">
								{formatRemaining(remainingMs)}
							</p>
							<p className="mt-2 text-xs opacity-70">
								Termina: {formatTime(endsAt)}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-1000",
									isExpired
										? "bg-red-500"
										: isAlmostDone
											? "bg-amber-500"
											: "bg-emerald-500",
								)}
								style={{ width: `${Math.min(100, progress)}%` }}
							/>
						</div>
						<div className="grid gap-2 text-center text-sm sm:grid-cols-4">
							<Metric label="Plan" value={session.planNombre} />
							<Metric label="Tiempo" value={`${session.minutosTotales} min`} />
							<Metric
								label="Valor"
								value={`$${Number(session.precio).toLocaleString("es-CO")}`}
							/>
							<Metric label="Creada por" value={session.creadoPor} />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="truncate font-semibold">{value}</p>
		</div>
	);
}

function formatRemaining(ms: number) {
	if (ms <= 0) {
		return "00:00:00";
	}

	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds]
		.map((value) => value.toString().padStart(2, "0"))
		.join(":");
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("es-CO", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function formatTime(value: number) {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
