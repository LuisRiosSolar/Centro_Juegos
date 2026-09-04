"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal } from "lucide-react";

import {
	SessionCountdownCard,
	type ActiveSessionCardData,
} from "@/components/session-countdown-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export type SessionFilterStatus =
	| "TODAS"
	| "ACTIVA"
	| "POR_TERMINAR"
	| "TIEMPO_TERMINADO"
	| "CANCELADA"
	| "FINALIZADA";

const statusLabels: Record<SessionFilterStatus, string> = {
	TODAS: "Todos los estados",
	ACTIVA: "Activas (En juego)",
	POR_TERMINAR: "Por terminar (≤ 10 min)",
	TIEMPO_TERMINADO: "Tiempo cumplido / Vencidas",
	CANCELADA: "Canceladas manualmente",
	FINALIZADA: "Finalizadas",
};

export function AdminSessionList({
	sessions,
}: {
	sessions: ActiveSessionCardData[];
}) {
	const [status, setStatus] = useState<SessionFilterStatus>("TODAS");
	const [query, setQuery] = useState("");
	const [pageSize, setPageSize] = useState<number>(6);
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Filtro de sesiones
	const filteredSessions = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase("es-CO");

		return sessions.filter((session) => {
			const category = getSessionCategory(session);
			let matchesStatus = false;

			if (status === "TODAS") {
				matchesStatus = true;
			} else if (status === "ACTIVA") {
				matchesStatus = category === "ACTIVA" || category === "POR_TERMINAR";
			} else {
				matchesStatus = category === status;
			}

			const matchesQuery =
				!normalizedQuery ||
				[
					session.clienteNombre,
					session.clienteIdentificacion,
					session.responsableNombre,
					session.responsableTelefono,
					session.planNombre,
				].some((value) =>
					(value || "").toLocaleLowerCase("es-CO").includes(normalizedQuery),
				);

			return matchesStatus && matchesQuery;
		});
	}, [query, sessions, status]);

	// Reiniciar a la primera página cuando cambian los filtros
	useEffect(() => {
		setCurrentPage(1);
	}, [query, status, pageSize]);

	// Paginación
	const effectivePageSize = pageSize === 0 ? filteredSessions.length || 1 : pageSize;
	const totalPages = Math.max(1, Math.ceil(filteredSessions.length / effectivePageSize));
	const safePage = Math.min(currentPage, totalPages);

	const startIndex = (safePage - 1) * effectivePageSize;
	const endIndex = Math.min(startIndex + effectivePageSize, filteredSessions.length);
	const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

	return (
		<section className="space-y-4">
			{/* ── Controles de Búsqueda y Filtro ── */}
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold tracking-tight">Sesiones</h2>
						<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
							{filteredSessions.length}
						</span>
					</div>
					<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
						Mostrando {filteredSessions.length === 0 ? 0 : startIndex + 1} - {endIndex} de {filteredSessions.length} encontradas ({sessions.length} en total)
					</p>
				</div>

				<div className="grid gap-2 sm:grid-cols-[13rem_16rem]">
					{/* Filtro por estado */}
					<Select
						value={status}
						onValueChange={(value) =>
							setStatus((value ?? "TODAS") as SessionFilterStatus)
						}
					>
						<SelectTrigger aria-label="Filtrar por estado" className="w-full bg-card">
							<SelectValue>
								{(value) =>
									statusLabels[value as SessionFilterStatus] ?? statusLabels.TODAS
								}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(statusLabels) as SessionFilterStatus[]).map((option) => (
								<SelectItem key={option} value={option}>
									{statusLabels[option]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Búsqueda */}
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Buscar niño, acudiente, plan..."
							aria-label="Buscar sesiones"
							className="pl-9 bg-card"
						/>
					</div>
				</div>
			</div>

			{/* ── Lista de Tarjetas ── */}
			{filteredSessions.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-3">
						<SlidersHorizontal className="size-6" />
					</div>
					<p className="text-base font-semibold text-foreground">
						No se encontraron sesiones
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						Prueba cambiando el filtro de estado o el término de búsqueda.
					</p>
				</div>
			) : (
				<div className="grid gap-3.5 md:grid-cols-2 2xl:grid-cols-3">
					{paginatedSessions.map((session) => (
						<SessionCountdownCard
							key={session.id}
							session={session}
							canAdjustTime
							compact
						/>
					))}
				</div>
			)}

			{/* ── Barra de Paginación ── */}
			{filteredSessions.length > 0 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
					{/* Selector de tamaño de página */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>Mostrar</span>
						<Select
							value={pageSize.toString()}
							onValueChange={(val) => setPageSize(Number(val))}
						>
							<SelectTrigger className="h-8 w-24 text-xs bg-card">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="6">6 por pág.</SelectItem>
								<SelectItem value="12">12 por pág.</SelectItem>
								<SelectItem value="18">18 por pág.</SelectItem>
								<SelectItem value="24">24 por pág.</SelectItem>
								<SelectItem value="0">Todas</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Controles de página */}
					{totalPages > 1 && (
						<div className="flex items-center gap-1.5">
							{/* Primera página */}
							<Button
								variant="outline"
								size="icon"
								className="size-8 text-xs"
								onClick={() => setCurrentPage(1)}
								disabled={safePage <= 1}
								title="Primera página"
							>
								<ChevronsLeft className="size-4" />
							</Button>

							{/* Anterior */}
							<Button
								variant="outline"
								size="sm"
								className="h-8 px-2.5 text-xs gap-1"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={safePage <= 1}
							>
								<ChevronLeft className="size-3.5" />
								<span className="hidden xs:inline">Anterior</span>
							</Button>

							{/* Números de página */}
							<div className="flex items-center gap-1 px-1">
								{getPageNumbers(safePage, totalPages).map((p, idx) =>
									p === -1 ? (
										<span key={`dots-${idx}`} className="px-1 text-xs text-muted-foreground">
											...
										</span>
									) : (
										<Button
											key={p}
											variant={p === safePage ? "default" : "outline"}
											size="icon"
											className={`size-8 text-xs font-bold ${
												p === safePage ? "shadow-sm" : ""
											}`}
											onClick={() => setCurrentPage(p)}
										>
											{p}
										</Button>
									),
								)}
							</div>

							{/* Siguiente */}
							<Button
								variant="outline"
								size="sm"
								className="h-8 px-2.5 text-xs gap-1"
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								disabled={safePage >= totalPages}
							>
								<span className="hidden xs:inline">Siguiente</span>
								<ChevronRight className="size-3.5" />
							</Button>

							{/* Última página */}
							<Button
								variant="outline"
								size="icon"
								className="size-8 text-xs"
								onClick={() => setCurrentPage(totalPages)}
								disabled={safePage >= totalPages}
								title="Última página"
							>
								<ChevronsRight className="size-4" />
							</Button>
						</div>
					)}
				</div>
			)}
		</section>
	);
}

// ─── Helpers de Categorización y Paginación ──────────────────────────────────
function getSessionCategory(session: ActiveSessionCardData): SessionFilterStatus {
	if (session.estado === "CANCELADA") return "CANCELADA";
	if (session.estado === "FINALIZADA") return "FINALIZADA";

	const endsAt =
		new Date(session.fechaIngreso).getTime() + session.minutosTotales * 60_000;
	const remainingMs = endsAt - Date.now();

	if (remainingMs <= 0) return "TIEMPO_TERMINADO";
	if (remainingMs <= 10 * 60_000) return "POR_TERMINAR";
	return "ACTIVA";
}

function getPageNumbers(current: number, total: number): number[] {
	if (total <= 5) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}

	if (current <= 3) {
		return [1, 2, 3, -1, total];
	}

	if (current >= total - 2) {
		return [1, -1, total - 2, total - 1, total];
	}

	return [1, -1, current, -1, total];
}
