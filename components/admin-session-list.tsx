"use client";

import { useMemo, useState } from "react";

import {
	SessionCountdownCard,
	type ActiveSessionCardData,
} from "@/components/session-countdown-card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type SessionStatus = "TODAS" | ActiveSessionCardData["estado"];

const statusLabels: Record<SessionStatus, string> = {
	TODAS: "Todos los estados",
	ACTIVA: "Activas",
	FINALIZADA: "Finalizadas",
	CANCELADA: "Canceladas",
};

export function AdminSessionList({
	sessions,
}: {
	sessions: ActiveSessionCardData[];
}) {
	const [status, setStatus] = useState<SessionStatus>("TODAS");
	const [query, setQuery] = useState("");
	const filteredSessions = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase("es-CO");

		return sessions.filter((session) => {
			const matchesStatus =
				status === "TODAS" || getEffectiveSessionStatus(session) === status;
			const matchesQuery =
				!normalizedQuery ||
				[
					session.clienteNombre,
					session.clienteIdentificacion,
					session.planNombre,
				].some((value) =>
					value.toLocaleLowerCase("es-CO").includes(normalizedQuery),
				);

			return matchesStatus && matchesQuery;
		});
	}, [query, sessions, status]);

	return (
		<section className="space-y-3">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h2 className="text-xl font-semibold tracking-tight">Sesiones</h2>
					<p className="text-sm text-muted-foreground">
						{filteredSessions.length} de {sessions.length} sesiones
					</p>
				</div>
				<div className="grid gap-2 sm:grid-cols-[12rem_18rem]">
					<Select
						value={status}
						onValueChange={(value) =>
							setStatus((value ?? "TODAS") as SessionStatus)
						}
					>
						<SelectTrigger aria-label="Filtrar por estado" className="w-full">
							<SelectValue>
								{(value) =>
									statusLabels[value as SessionStatus] ?? statusLabels.TODAS
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(statusLabels) as SessionStatus[]).map((option) => (
								<SelectItem key={option} value={option}>
									{statusLabels[option]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Buscar jugador, documento o plan"
						aria-label="Buscar sesiones"
					/>
				</div>
			</div>

			{filteredSessions.length === 0 ? (
				<p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
					No hay sesiones que coincidan con los filtros.
				</p>
			) : (
				<div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
					{filteredSessions.map((session) => (
						<SessionCountdownCard
							key={session.id}
							session={session}
							canAdjustTime
							compact
						/>
					))}
				</div>
			)}
		</section>
	);
}

function getEffectiveSessionStatus(
	session: ActiveSessionCardData,
): ActiveSessionCardData["estado"] {
	if (session.estado !== "ACTIVA") return session.estado;

	const endsAt =
		new Date(session.fechaIngreso).getTime() + session.minutosTotales * 60_000;

	return endsAt > Date.now() ? "ACTIVA" : "FINALIZADA";
}
