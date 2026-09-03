"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Clock, Gamepad2, Phone, PlusCircleIcon, UserRound } from "lucide-react";
import { toast } from "sonner";

import { adjustSessionTime, finishGameSession } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ActiveSessionCardData = {
	id: string;
	fechaIngreso: string;
	fechaSalida?: string | null;
	minutosTotales: number;
	estado: "ACTIVA" | "FINALIZADA" | "CANCELADA";
	clienteNombre: string;
	clienteIdentificacion: string;
	responsableNombre: string;
	responsableTelefono: string;
	planNombre: string;
	planMinutos?: number;
	precio: string;
	creadoPor: string;
};

type SessionCountdownCardProps = {
	session: ActiveSessionCardData;
	canAdjustTime?: boolean;
	compact?: boolean;
};

export function getPlanDynamicOptions(planMinutos: number = 30): number[] {
	const base = Math.max(1, planMinutos);
	const half = Math.max(1, Math.round(base * 0.5));
	return [
		half, // 0.5x (ej. 5, 8, 10, 15, 30)
		base, // 1x   (ej. 10, 15, 20, 30, 60)
		base * 2, // 2x (ej. 20, 30, 40, 60, 120)
		base * 3, // 3x (ej. 30, 45, 60, 90, 180)
	];
}

export function SessionCountdownCard({
	session,
	canAdjustTime = false,
	compact = false,
}: SessionCountdownCardProps) {
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
	const isManuallyFinished = session.estado !== "ACTIVA";
	const isFinished = isManuallyFinished || remainingMs <= 0;
	const isAlmostDone = !isFinished && remainingMs <= 10 * 60_000;
	const [isPending, startTransition] = useTransition();

	const planMinutes =
		session.planMinutos && session.planMinutos > 0
			? session.planMinutos
			: session.minutosTotales;
	const planPrice = Number(session.precio) || 0;
	const dynamicAddOptions = useMemo(
		() => getPlanDynamicOptions(planMinutes),
		[planMinutes],
	);

	function adjustTime(minutes: number) {
		startTransition(async () => {
			const response = await adjustSessionTime(session.id, minutes);

			if (!response.ok) {
				toast.error(response.message);
				return;
			}
			toast.success(response.message);
		});
	}

	function finishSession() {
		startTransition(async () => {
			const response = await finishGameSession(session.id);

			if (response.ok) {
				toast.success(response.message);
				return;
			}

			toast.error(response.message);
		});
	}

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);

		return () => window.clearInterval(interval);
	}, []);

	return (
		<Card
			className={cn(
				"h-full border-border/70 bg-card transition-all",
				isFinished && "border-destructive/40 bg-destructive/5 opacity-85",
			)}
		>
			<CardContent className={cn("p-5", compact && "p-4")}>
				<div className={cn("flex flex-col gap-5", compact && "gap-3")}>
					<div
						className={cn(
							"flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
							compact && "md:flex-col",
						)}
					>
						<div className={cn("space-y-3", compact && "space-y-2")}>
							<div className="flex flex-wrap items-center gap-2">
								<span
									className={cn(
										"rounded-full px-3 py-1 text-xs font-semibold",
										isFinished
											? "bg-destructive text-destructive-foreground"
											: isAlmostDone
												? "bg-primary text-primary-foreground"
												: "bg-secondary text-secondary-foreground",
									)}
								>
									{isManuallyFinished
										? session.estado === "FINALIZADA"
											? "TERMINÓ"
											: session.estado
										: isFinished
											? "TIEMPO TERMINADO"
											: isAlmostDone
												? "POR TERMINAR"
												: "ACTIVA"}
								</span>
								<span className="text-xs text-muted-foreground">
									{isFinished && session.fechaSalida
										? `Salida: ${formatDateTime(session.fechaSalida)}`
										: `Inicio: ${formatDateTime(session.fechaIngreso)}`}
								</span>
							</div>

							<div>
								<h3
									className={cn(
										"flex items-center gap-2 font-semibold tracking-tight",
										compact ? "text-xl" : "text-2xl",
									)}
								>
									<Gamepad2 className="size-5 text-primary" />
									{session.clienteNombre}
								</h3>
								<p className="mt-1 text-xs text-muted-foreground">
									ID {session.clienteIdentificacion}
								</p>
							</div>

							<div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
								<p className="flex items-center gap-2">
									<UserRound className="size-3.5" />
									{session.responsableNombre}
								</p>
								<p className="flex items-center gap-2">
									<Phone className="size-3.5" />
									{session.responsableTelefono}
								</p>
							</div>
						</div>

						<Card size="sm" className={cn(!compact && "md:min-w-56", "border-border/60 shadow-xs")}>
							<CardContent className={cn("p-4 text-center", compact && "p-3")}>
								<p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
									<Clock className="size-3.5" />
									{isManuallyFinished ? "Terminó" : "Cuenta regresiva"}
								</p>
								<p className="mt-2 font-mono text-3xl font-bold tracking-tight tabular-nums text-foreground">
									{isManuallyFinished
										? "TERMINÓ"
										: formatRemaining(remainingMs)}
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{isManuallyFinished && session.fechaSalida
										? `Salida: ${formatDateTime(session.fechaSalida)}`
										: `Termina: ${formatTime(endsAt)}`}
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-4">
						<progress
							className="h-2.5 w-full rounded-full overflow-hidden"
							value={isManuallyFinished ? 100 : Math.min(100, progress)}
							max={100}
						/>

						{canAdjustTime ? (
							<div className="space-y-3 pt-1">
								{/* Dynamic Add Time Section */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											<PlusCircleIcon className="size-3.5 text-primary" />
											{isFinished ? "Reanudar con tiempo extra" : "Agregar tiempo"}
										</p>
										<span className="text-[11px] text-muted-foreground">
											Tarifa {session.planNombre} ({planMinutes} min)
										</span>
									</div>

									<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
										{dynamicAddOptions.map((minutes) => {
											const cost = Math.round(
												(planPrice / planMinutes) * minutes,
											);
											return (
												<Button
													key={minutes}
													variant="outline"
													size="sm"
													type="button"
													disabled={isPending}
													onClick={() => adjustTime(minutes)}
													className="flex h-auto flex-col items-center justify-center gap-0.5 py-2 px-2 border-border/80 hover:border-primary/60 hover:bg-primary/5 transition-all shadow-xs"
												>
													<span className="font-bold text-xs sm:text-sm text-foreground">
														+{minutes} min
													</span>
													<span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
														+${cost.toLocaleString("es-CO")}
													</span>
												</Button>
											);
										})}
									</div>
								</div>

								<div>
									<Button
										variant="destructive"
										size="sm"
										type="button"
										disabled={isPending || isFinished}
										onClick={finishSession}
									>
										Finalizar sesión
									</Button>
								</div>
							</div>
						) : null}

						<div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
							<Metric label="Plan" value={session.planNombre} />
							<Metric label="Tiempo total" value={`${session.minutosTotales} min`} />
							<Metric
								label="Valor base"
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
		<div className="rounded-xl border border-border/60 bg-muted/40 p-2">
			<p className="text-[11px] text-muted-foreground">{label}</p>
			<p className="mt-0.5 font-bold text-foreground truncate">{value}</p>
		</div>
	);
}

function formatRemaining(ms: number): string {
	if (ms <= 0) return "00:00:00";

	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds]
		.map((part) => part.toString().padStart(2, "0"))
		.join(":");
}

function formatTime(timestamp: number): string {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Bogota",
	}).format(new Date(timestamp));
}

function formatDateTime(isoString: string): string {
	return new Intl.DateTimeFormat("es-CO", {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: "America/Bogota",
	}).format(new Date(isoString));
}
