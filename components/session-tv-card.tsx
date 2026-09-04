"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActiveSessionCardData } from "@/components/session-countdown-card";
import { detectGender } from "@/components/session-countdown-card";
import { cn } from "@/lib/utils";

// ─── Paletas temáticas para tarjetas de niños en TV ───────────────────────────
const KID_PALETTES = [
	{
		theme: "orange",
		bg: "linear-gradient(135deg, #FF6B00 0%, #FF881A 100%)",
		border: "rgba(255, 107, 0, 0.4)",
		glow: "rgba(255, 107, 0, 0.3)",
		accent: "#FFD600",
		badgeBg: "rgba(255, 255, 255, 0.25)",
	},
	{
		theme: "purple",
		bg: "linear-gradient(135deg, #7B2FBE 0%, #9D4EDD 100%)",
		border: "rgba(123, 47, 190, 0.4)",
		glow: "rgba(123, 47, 190, 0.3)",
		accent: "#FF80BF",
		badgeBg: "rgba(255, 255, 255, 0.25)",
	},
	{
		theme: "teal",
		bg: "linear-gradient(135deg, #00B8A9 0%, #00D2C4 100%)",
		border: "rgba(0, 184, 169, 0.4)",
		glow: "rgba(0, 184, 169, 0.3)",
		accent: "#FFE600",
		badgeBg: "rgba(255, 255, 255, 0.25)",
	},
	{
		theme: "green",
		bg: "linear-gradient(135deg, #4CAF1A 0%, #68D324 100%)",
		border: "rgba(76, 175, 26, 0.4)",
		glow: "rgba(76, 175, 26, 0.3)",
		accent: "#FFF066",
		badgeBg: "rgba(255, 255, 255, 0.25)",
	},
	{
		theme: "pink",
		bg: "linear-gradient(135deg, #FF3D9A 0%, #FF66B2 100%)",
		border: "rgba(255, 61, 154, 0.4)",
		glow: "rgba(255, 61, 154, 0.3)",
		accent: "#FFDE59",
		badgeBg: "rgba(255, 255, 255, 0.25)",
	},
	{
		theme: "blue",
		bg: "linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)",
		border: "rgba(26, 115, 232, 0.4)",
		glow: "rgba(26, 115, 232, 0.3)",
		accent: "#FFCA28",
		badgeBg: "rgba(255, 255, 255, 0.25)",
	},
];

function formatParts(ms: number) {
	if (ms <= 0) return { h: "00", m: "00", s: "00" };
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return {
		h: hours.toString().padStart(2, "0"),
		m: minutes.toString().padStart(2, "0"),
		s: seconds.toString().padStart(2, "0"),
	};
}

function formatTime(timestamp: number): string {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Bogota",
	}).format(new Date(timestamp));
}

export function SessionTvCard({
	session,
	paletteIndex = 0,
}: {
	session: ActiveSessionCardData;
	paletteIndex?: number;
}) {
	const [now, setNow] = useState(() => Date.now());
	const startedAt = useMemo(
		() => new Date(session.fechaIngreso).getTime(),
		[session.fechaIngreso],
	);
	const endsAt = startedAt + session.minutosTotales * 60_000;
	const totalMs = Math.max(1, endsAt - startedAt);
	const remainingMs = endsAt - now;
	const isFinished = session.estado !== "ACTIVA" || remainingMs <= 0;
	const isLast10Seconds = !isFinished && remainingMs > 0 && remainingMs <= 10_000;
	const isAlmostDone = !isFinished && !isLast10Seconds && remainingMs <= 10 * 60_000;
	const progress = Math.min(100, Math.max(0, ((now - startedAt) / totalMs) * 100));

	const gender = detectGender(session.clienteNombre);
	const palette = KID_PALETTES[paletteIndex % KID_PALETTES.length];
	const time = formatParts(remainingMs);

	useEffect(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<div
			className={cn(
				"relative flex flex-col justify-between h-full overflow-hidden rounded-3xl p-5 sm:p-6 text-white transition-all shadow-xl",
				isFinished && "opacity-85 grayscale-[0.3]",
				isLast10Seconds && "animate-kid-warning z-20 ring-4 ring-white/70"
			)}
			style={{
				background: isFinished
					? "linear-gradient(135deg, #2D1515 0%, #1A0B0B 100%)"
					: palette.bg,
				filter: isLast10Seconds ? "brightness(1.12) saturate(1.25)" : undefined,
				boxShadow: isFinished
					? "0 10px 30px rgba(239, 68, 68, 0.2)"
					: isLast10Seconds
						? `0 0 45px ${palette.glow}, 0 0 25px rgba(255, 255, 255, 0.7), 0 15px 35px rgba(0, 0, 0, 0.3)`
						: `0 12px 35px ${palette.glow}`,
				border: isFinished
					? "2px solid rgba(239, 68, 68, 0.3)"
					: isLast10Seconds
						? "3px solid rgba(255, 255, 255, 0.9)"
						: "2px solid rgba(255, 255, 255, 0.2)",
			}}
		>
			{/* ── Patrón decorativo de fondo para niños ── */}
			<div
				className="pointer-events-none absolute inset-0 opacity-10"
				style={{
					backgroundImage: `radial-gradient(circle at 10px 10px, white 2px, transparent 0)`,
					backgroundSize: "28px 28px",
				}}
			/>

			{/* ── Círculos difuminados de color ── */}
			<div
				className={cn(
					"pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-2xl opacity-30 transition-all",
					isLast10Seconds && "size-48 opacity-70 bg-white/40 animate-pulse"
				)}
				style={{ background: isLast10Seconds ? "rgba(255, 255, 255, 0.6)" : palette.accent }}
			/>

			{/* ── Top Header: Plan + Horario + Badge de Estado ── */}
			<div className="relative z-10 flex items-center justify-between gap-2 min-w-0">
				<div className="flex items-center gap-2 min-w-0 flex-1">
					<span
						className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm shrink min-w-0"
						style={{
							background: "rgba(0, 0, 0, 0.28)",
							backdropFilter: "blur(8px)",
						}}
						title={session.planNombre}
					>
						<span className="shrink-0">🎮</span>
						<span className="truncate max-w-[80px] sm:max-w-[110px] md:max-w-[130px]">
							{session.planNombre}
						</span>
					</span>
					<span className="text-[11px] sm:text-xs font-semibold opacity-90 whitespace-nowrap shrink-0">
						Termina: {formatTime(endsAt)}
					</span>
				</div>

				<span
					suppressHydrationWarning
					className={cn(
						"rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-sm transition-all whitespace-nowrap shrink-0",
						isFinished
							? "bg-red-500/80 text-white"
							: isLast10Seconds
								? "bg-amber-300 text-neutral-950 font-black animate-pulse shadow-md scale-105"
								: isAlmostDone
									? "bg-amber-400 text-neutral-900 animate-pulse font-black"
									: "bg-white/25 text-white"
					)}
					style={{ backdropFilter: "blur(8px)" }}
				>
					{isFinished
						? "⚠️ Terminado"
						: isLast10Seconds
							? "🚨 ¡ÚLTIMOS 10s!"
							: isAlmostDone
								? "⏳ Por terminar"
								: "✨ Jugando"}
				</span>
			</div>

			{/* ── Centro: Nombre del Niño + Ícono visual ── */}
			<div className="relative z-10 my-4 flex items-center gap-4">
				<div
					className={cn(
						"flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl text-3xl sm:text-4xl shadow-md transition-all",
						isLast10Seconds && "animate-bounce shadow-yellow-400/50 scale-110"
					)}
					style={{
						background: isLast10Seconds
							? "rgba(255, 255, 255, 0.35)"
							: "rgba(255, 255, 255, 0.22)",
						backdropFilter: "blur(12px)",
						border: isLast10Seconds
							? "3px solid #FFF066"
							: "2px solid rgba(255, 255, 255, 0.35)",
					}}
				>
					{isFinished
						? "😴"
						: isLast10Seconds
							? "⏰"
							: gender === "girl"
								? "👧"
								: "👦"}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-bold uppercase tracking-widest text-white/80">
						{gender === "girl" ? "Jugadora" : "Jugador"}
					</p>
					<h2 className="truncate text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-md text-white">
						{session.clienteNombre}
					</h2>
				</div>
			</div>

			{/* ── Contador digital grande estilo juego ── */}
			<div
				suppressHydrationWarning
				className={cn(
					"relative z-10 rounded-2xl p-3 sm:p-4 text-center shadow-inner transition-all",
					isLast10Seconds && "border-2 border-amber-300/90 bg-black/45 shadow-lg shadow-amber-500/40 animate-countdown-urgent"
				)}
				style={{
					background: isLast10Seconds ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.28)",
					backdropFilter: "blur(10px)",
					border: isLast10Seconds ? "2px solid #FFD600" : "1px solid rgba(255, 255, 255, 0.15)",
				}}
			>
				<p className={cn(
					"text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-1.5 transition-colors",
					isLast10Seconds ? "text-amber-300 animate-pulse font-black" : "text-white/75"
				)}>
					{isFinished
						? "Sesión finalizada"
						: isLast10Seconds
							? "⚡ ¡TIEMPO POR TERMINAR! ⚡"
							: "Tiempo restante"}
				</p>
				
				{isFinished ? (
					<p className="font-mono text-3xl sm:text-4xl font-black text-red-300 drop-shadow">
						00:00:00
					</p>
				) : (
					<div className="flex items-center justify-center gap-1.5 sm:gap-2 font-mono">
						<div className="flex flex-col items-center">
							<span className={cn(
								"text-2xl sm:text-4xl font-black tabular-nums drop-shadow text-white",
								isLast10Seconds && "text-amber-200"
							)}>
								{time.h}
							</span>
							<span className="text-[9px] uppercase font-bold text-white/60">hrs</span>
						</div>
						<span className="text-2xl sm:text-3xl font-black text-white/60 -mt-3">:</span>
						<div className="flex flex-col items-center">
							<span className={cn(
								"text-2xl sm:text-4xl font-black tabular-nums drop-shadow text-white",
								isLast10Seconds && "text-amber-200"
							)}>
								{time.m}
							</span>
							<span className="text-[9px] uppercase font-bold text-white/60">min</span>
						</div>
						<span className="text-2xl sm:text-3xl font-black text-white/60 -mt-3">:</span>
						<div className="flex flex-col items-center">
							<span className={cn(
								"text-2xl sm:text-4xl font-black tabular-nums drop-shadow text-white",
								isLast10Seconds && "text-yellow-300 text-3xl sm:text-5xl drop-shadow-[0_0_12px_rgba(255,215,0,0.9)] animate-pulse"
							)}>
								{time.s}
							</span>
							<span className={cn(
								"text-[9px] uppercase font-bold",
								isLast10Seconds ? "text-yellow-300 font-black" : "text-white/60"
							)}>
								seg
							</span>
						</div>
					</div>
				)}
			</div>

			{/* ── Barra de progreso inferior ── */}
			<div className="relative z-10 mt-3 space-y-1.5">
				<div
					className="h-2.5 w-full overflow-hidden rounded-full shadow-inner"
					style={{ background: "rgba(0, 0, 0, 0.3)" }}
				>
					<div
						suppressHydrationWarning
						className="h-full rounded-full transition-all duration-700"
						style={{
							width: `${isFinished ? 100 : Math.min(100, Math.max(0, progress))}%`,
							background: isFinished
								? "#EF4444"
								: isLast10Seconds
									? "#FFD600"
									: isAlmostDone
										? "#FBBF24"
										: "#FFFFFF",
							boxShadow: isLast10Seconds
								? "0 0 15px rgba(255, 214, 0, 1)"
								: "0 0 10px rgba(255, 255, 255, 0.8)",
						}}
					/>
				</div>
				<div suppressHydrationWarning className="flex justify-between text-[11px] font-bold text-white/80 px-0.5">
					<span>{Math.round(progress)}% completado</span>
					<span>{session.minutosTotales} min totales</span>
				</div>
			</div>
		</div>
	);
}
