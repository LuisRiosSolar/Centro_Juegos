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
	const isAlmostDone = !isFinished && remainingMs <= 10 * 60_000;
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
				"relative flex flex-col justify-between overflow-hidden rounded-3xl p-5 sm:p-6 text-white transition-all shadow-xl",
				isFinished && "opacity-85 grayscale-[0.3]"
			)}
			style={{
				background: isFinished
					? "linear-gradient(135deg, #2D1515 0%, #1A0B0B 100%)"
					: palette.bg,
				boxShadow: isFinished
					? "0 10px 30px rgba(239, 68, 68, 0.2)"
					: `0 12px 35px ${palette.glow}`,
				border: isFinished
					? "2px solid rgba(239, 68, 68, 0.3)"
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
				className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-2xl opacity-30"
				style={{ background: palette.accent }}
			/>

			{/* ── Top Header: Plan + Badge de Estado ── */}
			<div className="relative z-10 flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span
						className="rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm"
						style={{
							background: "rgba(0, 0, 0, 0.25)",
							backdropFilter: "blur(8px)",
						}}
					>
						🎮 {session.planNombre}
					</span>
					<span className="text-xs font-semibold opacity-90">
						Termina: {formatTime(endsAt)}
					</span>
				</div>

				<span
					className={cn(
						"rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm",
						isFinished
							? "bg-red-500/80 text-white"
							: isAlmostDone
								? "bg-amber-400 text-neutral-900 animate-pulse font-black"
								: "bg-white/25 text-white"
					)}
					style={{ backdropFilter: "blur(8px)" }}
				>
					{isFinished ? "⚠️ Terminado" : isAlmostDone ? "⏳ Por terminar" : "✨ Jugando"}
				</span>
			</div>

			{/* ── Centro: Nombre del Niño + Ícono visual ── */}
			<div className="relative z-10 my-4 flex items-center gap-4">
				<div
					className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl text-3xl sm:text-4xl shadow-md transition-transform hover:scale-105"
					style={{
						background: "rgba(255, 255, 255, 0.22)",
						backdropFilter: "blur(12px)",
						border: "2px solid rgba(255, 255, 255, 0.35)",
					}}
				>
					{isFinished ? "😴" : gender === "girl" ? "👧" : "👦"}
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
			<div className="relative z-10 rounded-2xl p-3 sm:p-4 text-center shadow-inner"
				style={{
					background: "rgba(0, 0, 0, 0.28)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
				}}
			>
				<p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/75 mb-1.5">
					{isFinished ? "Sesión finalizada" : "Tiempo restante"}
				</p>
				
				{isFinished ? (
					<p className="font-mono text-3xl sm:text-4xl font-black text-red-300 drop-shadow">
						00:00:00
					</p>
				) : (
					<div className="flex items-center justify-center gap-1.5 sm:gap-2 font-mono">
						<div className="flex flex-col items-center">
							<span className="text-2xl sm:text-4xl font-black tabular-nums drop-shadow text-white">
								{time.h}
							</span>
							<span className="text-[9px] uppercase font-bold text-white/60">hrs</span>
						</div>
						<span className="text-2xl sm:text-3xl font-black text-white/60 -mt-3">:</span>
						<div className="flex flex-col items-center">
							<span className="text-2xl sm:text-4xl font-black tabular-nums drop-shadow text-white">
								{time.m}
							</span>
							<span className="text-[9px] uppercase font-bold text-white/60">min</span>
						</div>
						<span className="text-2xl sm:text-3xl font-black text-white/60 -mt-3">:</span>
						<div className="flex flex-col items-center">
							<span className="text-2xl sm:text-4xl font-black tabular-nums drop-shadow text-white">
								{time.s}
							</span>
							<span className="text-[9px] uppercase font-bold text-white/60">seg</span>
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
						className="h-full rounded-full transition-all duration-700"
						style={{
							width: `${isFinished ? 100 : Math.min(100, Math.max(0, progress))}%`,
							background: isFinished
								? "#EF4444"
								: isAlmostDone
									? "#FBBF24"
									: "#FFFFFF",
							boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
						}}
					/>
				</div>
				<div className="flex justify-between text-[11px] font-bold text-white/80 px-0.5">
					<span>{Math.round(progress)}% completado</span>
					<span>{session.minutosTotales} min totales</span>
				</div>
			</div>
		</div>
	);
}
