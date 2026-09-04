"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Clock, Phone, PlusCircleIcon, UserRound, Sparkles } from "lucide-react";
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

// ─── Heurística de género por nombre ──────────────────────────────────────────
const FEMALE_NAMES = new Set([
	"isabel", "maria", "sofia", "valentina", "sara", "paula", "camila", "daniela", "alejandra",
	"andrea", "ana", "laura", "natalia", "gabriela", "carolina", "diana", "lucia", "juliana",
	"manuela", "monica", "paola", "angela", "vanessa", "jessica", "fernanda", "tatiana",
	"veronica", "stephania", "xiomara", "yesenia", "leidy", "luz", "rosa", "esperanza",
	"martha", "gloria", "adriana", "mariana", "pilar", "claudia", "patricia", "lorena",
	"viviana", "beatriz", "carmen", "olga", "susana", "nubia", "liliana", "blanca", "elsa",
	"norma", "alba", "salome", "valeria", "guadalupe", "antonella", "luciana", "samanta",
	"emilia", "dulce", "mia", "emma", "zoe", "isabella", "victoria", "rebecca", "martina"
]);

const MALE_NAMES = new Set([
	"juan", "jose", "carlos", "luis", "miguel", "andres", "santiago", "sebastian", "nicolas",
	"alejandro", "david", "daniel", "jorge", "pablo", "antonio", "francisco", "rafael",
	"gabriel", "sergio", "ivan", "mario", "hector", "oscar", "edgar", "julian", "camilo",
	"christian", "john", "steven", "kevin", "bryan", "wilmar", "wilson", "henry", "cesar",
	"manuel", "roberto", "javier", "pedro", "eduardo", "alberto", "fernando", "diego",
	"rodrigo", "mauricio", "fabio", "nelson", "omar", "gustavo", "alvaro", "hernan",
	"ernesto", "felipe", "jaime", "simon", "tomas", "matias", "samuel", "emiliano",
	"joaquin", "maximiliano", "ian", "thiago", "dylan", "mateo", "lucas", "martin", "santino"
]);

export function detectGender(name: string): "boy" | "girl" {
	const normalized = (name || "").trim().toLowerCase().split(/\s+/)[0];
	if (FEMALE_NAMES.has(normalized)) return "girl";
	if (MALE_NAMES.has(normalized)) return "boy";
	if (["a", "ia", "na", "ela", "ita", "ina", "era", "isa", "osa"].some((e) => normalized.endsWith(e))) {
		return "girl";
	}
	return "boy";
}

export function getPlanDynamicOptions(planMinutos: number = 30): number[] {
	const base = Math.max(1, planMinutos);
	const half = Math.max(1, Math.round(base * 0.5));
	return [half, base, base * 2, base * 3];
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
	const isCancelled = session.estado === "CANCELADA";
	const isDbFinalized = session.estado === "FINALIZADA";
	const isTimeOver = session.estado === "ACTIVA" && remainingMs <= 0;
	const isFinished = isCancelled || isDbFinalized || isTimeOver;
	const isAlmostDone = !isFinished && session.estado === "ACTIVA" && remainingMs <= 10 * 60_000;
	const [isPending, startTransition] = useTransition();

	const gender = detectGender(session.clienteNombre);

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

	function handleCancelSession() {
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
				"h-full border-border/80 bg-card/95 transition-all shadow-sm hover:shadow-md",
				isFinished && "border-destructive/40 bg-destructive/5 opacity-90",
				isAlmostDone && "border-primary/50 shadow-primary/5"
			)}
		>
			<CardContent className={cn("p-4 sm:p-5", compact && "p-3 sm:p-4")}>
				<div className={cn("flex flex-col gap-3", compact && "gap-2.5")}>
					{/* ── Top Bar: Estado + Horario + Plan ── */}
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
						<div className="flex flex-wrap items-center gap-2">
							<span
								className={cn(
									"rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-2xs",
									isCancelled
										? "bg-rose-600 text-white"
										: isDbFinalized
											? "bg-muted text-muted-foreground border border-border"
											: isTimeOver
												? "bg-amber-500 text-amber-950 font-black"
												: isAlmostDone
													? "bg-primary text-primary-foreground animate-pulse"
													: "bg-emerald-600 text-white",
								)}
							>
								{isCancelled
									? "CANCELADA"
									: isDbFinalized
										? "FINALIZADA"
										: isTimeOver
											? "TIEMPO TERMINADO"
											: isAlmostDone
												? "POR TERMINAR"
												: "ACTIVA"}
							</span>
							<span className="text-[11px] text-muted-foreground font-medium">
								{isFinished && session.fechaSalida
									? `Salida: ${formatDateTime(session.fechaSalida)}`
									: `Inicio: ${formatDateTime(session.fechaIngreso)}`}
							</span>
						</div>

						<span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
							🎮 {session.planNombre}
						</span>
					</div>

					{/* ── Centro: Datos del Jugador y Acudiente (Izquierda) + Contador (Derecha) ── */}
					<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
						{/* Columna Izquierda: Jugador + Acudiente */}
						<div className="sm:col-span-7 flex flex-col justify-between gap-2.5 min-w-0">
							{/* Nombre e Ícono del Jugador */}
							<div className="flex items-center gap-3">
								<div
									className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner transition-transform"
									style={{
										background: isFinished
											? "rgba(239, 68, 68, 0.15)"
											: gender === "girl"
												? "linear-gradient(135deg, rgba(255, 61, 154, 0.2), rgba(255, 61, 154, 0.08))"
												: "linear-gradient(135deg, rgba(var(--primary) / 0.2), rgba(var(--primary) / 0.08))",
										border: isFinished
											? "1px solid rgba(239, 68, 68, 0.3)"
											: gender === "girl"
												? "1px solid rgba(255, 61, 154, 0.3)"
												: "1px solid rgba(var(--primary) / 0.3)",
									}}
								>
									{isCancelled ? "🚫" : isFinished ? "⏱️" : gender === "girl" ? "👧" : "👦"}
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
										Jugador(a)
									</p>
									<h3 className="truncate text-lg sm:text-xl font-extrabold tracking-tight text-foreground leading-tight">
										{session.clienteNombre}
									</h3>
									<p className="text-xs text-muted-foreground font-mono">
										ID: {session.clienteIdentificacion}
									</p>
								</div>
							</div>

							{/* Tarjeta del Responsable / Acudiente */}
							<div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 space-y-1 text-xs">
								<div className="flex items-center justify-between gap-2">
									<span className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0">
										<UserRound className="size-3.5 text-primary" />
										Acudiente:
									</span>
									<span className="font-bold text-foreground truncate text-right">
										{session.responsableNombre}
									</span>
								</div>
								<div className="flex items-center justify-between gap-2 border-t border-border/40 pt-1">
									<span className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0">
										<Phone className="size-3.5 text-primary" />
										Teléfono:
									</span>
									<span className="font-bold text-foreground font-mono text-right">
										{session.responsableTelefono}
									</span>
								</div>
							</div>
						</div>

						{/* Columna Derecha: Caja de Contador / Tiempo */}
						<div
							className={cn(
								"sm:col-span-5 flex flex-col justify-center items-center rounded-2xl border p-3 text-center transition-all min-h-[110px]",
								isCancelled
									? "border-rose-500/30 bg-rose-500/10"
									: isDbFinalized
										? "border-border/80 bg-muted/40"
										: isTimeOver
											? "border-amber-500/40 bg-amber-500/10"
											: isAlmostDone
												? "border-primary/40 bg-primary/10 shadow-xs shadow-primary/10"
												: "border-border/80 bg-muted/25"
							)}
						>
							<p className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<Clock className="size-3 text-primary shrink-0" />
								{isCancelled
									? "Cancelada"
									: isDbFinalized
										? "Finalizada"
										: isTimeOver
											? "Tiempo cumplido"
											: "Tiempo restante"}
							</p>
							<p
								className={cn(
									"mt-1 font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums",
									isCancelled
										? "text-rose-600 dark:text-rose-400"
										: isDbFinalized
											? "text-muted-foreground"
											: isTimeOver
												? "text-amber-600 dark:text-amber-400"
												: isAlmostDone
													? "text-primary"
													: "text-foreground"
								)}
							>
								{isFinished
									? "00:00:00"
									: formatRemaining(remainingMs)}
							</p>
							<p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">
								{isFinished && session.fechaSalida
									? `Salida: ${formatTime(new Date(session.fechaSalida).getTime())}`
									: `Termina: ${formatTime(endsAt)}`}
							</p>
						</div>
					</div>

					{/* ── Barra de Progreso ── */}
					<div className="space-y-3">
						<div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60 border border-border/40">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-500",
									isCancelled
										? "bg-rose-500"
										: isDbFinalized
											? "bg-muted-foreground"
											: isTimeOver
												? "bg-amber-500"
												: isAlmostDone
													? "bg-primary"
													: "bg-emerald-500"
								)}
								style={{
									width: `${isFinished ? 100 : Math.min(100, Math.max(0, progress))}%`,
								}}
							/>
						</div>

						{/* ── Acciones para Administrador (Agregar tiempo / Finalizar) ── */}
						{canAdjustTime ? (
							<div className="space-y-2.5 pt-0.5">
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
											<PlusCircleIcon className="size-3.5 text-primary" />
											{isFinished ? "Reanudar con tiempo extra" : "Agregar tiempo"}
										</p>
										<span className="text-[11px] text-muted-foreground">
											{session.planNombre} ({planMinutes} min)
										</span>
									</div>

									<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
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
													className="flex h-auto flex-col items-center justify-center gap-0.5 py-1.5 px-1 border-border/80 hover:border-primary/60 hover:bg-primary/5 transition-all"
												>
													<span className="font-bold text-xs text-foreground">
														+{minutes} min
													</span>
													<span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
														+${cost.toLocaleString("es-CO")}
													</span>
												</Button>
											);
										})}
									</div>
								</div>

								<div className="flex justify-end pt-1">
									<Button
										variant="destructive"
										size="sm"
										type="button"
										disabled={isPending || isFinished}
										onClick={handleCancelSession}
										className="h-8 text-xs font-semibold px-3"
									>
										Cancelar sesión
									</Button>
								</div>
							</div>
						) : null}

						{/* Métricas base */}
						<div className="grid grid-cols-2 gap-1.5 text-center text-xs sm:grid-cols-4 pt-1">
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
		<div className="rounded-xl border border-border/60 bg-muted/30 p-1.5 sm:p-2">
			<p className="text-[10px] sm:text-[11px] text-muted-foreground">{label}</p>
			<p className="mt-0.5 font-bold text-foreground truncate text-xs sm:text-sm">{value}</p>
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
