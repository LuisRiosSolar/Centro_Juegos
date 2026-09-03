"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Clock, Gamepad2, Phone, UserRound } from "lucide-react";
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
	precio: string;
	creadoPor: string;
};

type SessionCountdownCardProps = {
	session: ActiveSessionCardData;
	canAdjustTime?: boolean;
	compact?: boolean;
};

const adjustmentOptions = [3, 5, 10, 15, 20, 30] as const;

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

	function adjustTime(minutes: number) {
		if (minutes < 0 && session.minutosTotales + minutes < 1) {
			toast.error("Ajuste de tiempo excede el mínimo permitido.");
			return;
		}

		startTransition(async () => {
			const response = await adjustSessionTime(session.id, minutes);

			if (!response.ok) toast.error(response.message);
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
				"h-full",
				isFinished && "border-destructive/40 bg-destructive/5 opacity-80",
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
									<Gamepad2 className="size-5" />
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

						<Card size="sm" className={cn(!compact && "md:min-w-64")}>
							<CardContent className={cn("p-5 text-center", compact && "p-3")}>
								<p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
									<Clock className="size-4" />
									{isManuallyFinished ? "Terminó" : "Cuenta regresiva"}
								</p>
								<p className="mt-3 font-mono text-4xl font-semibold tracking-tight">
									{isManuallyFinished
										? "TERMINÓ"
										: formatRemaining(remainingMs)}
								</p>
								<p className="mt-2 text-xs text-muted-foreground">
									{isManuallyFinished && session.fechaSalida
										? `Salida: ${formatDateTime(session.fechaSalida)}`
										: `Termina: ${formatTime(endsAt)}`}
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-3">
						<progress
							className="h-3 w-full"
							value={isManuallyFinished ? 100 : Math.min(100, progress)}
							max={100}
						/>
						{canAdjustTime ? (
							<div className="grid gap-3 sm:grid-cols-2">
								<AdjustmentButtons
									label="Disminuir tiempo"
									options={adjustmentOptions}
									disabled={isPending || isFinished}
									canUse={(minutes) => session.minutosTotales - minutes >= 1}
									onAdjust={(minutes) => adjustTime(-minutes)}
								/>
								<AdjustmentButtons
									label={isFinished ? "Reanudar con tiempo" : "Agregar tiempo"}
									options={adjustmentOptions}
									disabled={isPending}
									canUse={() => true}
									onAdjust={adjustTime}
								/>
								<div className="sm:col-span-2">
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

function AdjustmentButtons({
	label,
	options,
	disabled,
	canUse,
	onAdjust,
}: {
	label: string;
	options: readonly number[];
	disabled: boolean;
	canUse: (minutes: number) => boolean;
	onAdjust: (minutes: number) => void;
}) {
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<div className="grid grid-cols-3 gap-1.5">
				{options.map((minutes) => (
					<Button
						key={minutes}
						variant="outline"
						size="xs"
						type="button"
						disabled={disabled || !canUse(minutes)}
						onClick={() => onAdjust(minutes)}
					>
						{minutes} min
					</Button>
				))}
			</div>
		</div>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<Card size="sm">
			<CardContent className="p-3">
				<p className="text-xs text-muted-foreground">{label}</p>
				<p className="truncate font-semibold">{value}</p>
			</CardContent>
		</Card>
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
