"use client";

import { useMemo, useState } from "react";
import {
	CalendarIcon,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	RotateCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";

import {
	SessionCountdownCard,
	type ActiveSessionCardData,
} from "@/components/session-countdown-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
	const todayStr = useMemo(() => getTodayString(), []);
	const yesterdayStr = useMemo(() => getYesterdayString(), []);

	// Estado de filtros
	const [selectedDate, setSelectedDate] = useState<string>(todayStr);
	const [calendarOpen, setCalendarOpen] = useState(false);
	const [status, setStatus] = useState<SessionFilterStatus>("TODAS");
	const [query, setQuery] = useState("");
	const [pageSize, setPageSize] = useState<number>(6);
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Filtro combinado: Fecha + Estado + Búsqueda
	const filteredSessions = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase("es-CO");

		return sessions.filter((session) => {
			// 1. Filtro por fecha (Colombia UTC-5)
			if (selectedDate !== "TODAS") {
				const sessionDate = getSessionDateString(session.fechaIngreso);
				if (sessionDate !== selectedDate) {
					return false;
				}
			}

			// 2. Filtro por estado
			const category = getSessionCategory(session);
			let matchesStatus = false;

			if (status === "TODAS") {
				matchesStatus = true;
			} else if (status === "ACTIVA") {
				matchesStatus = category === "ACTIVA" || category === "POR_TERMINAR";
			} else {
				matchesStatus = category === status;
			}

			if (!matchesStatus) return false;

			// 3. Filtro por búsqueda
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

			return matchesQuery;
		});
	}, [query, sessions, status, selectedDate]);

	function handleDateChange(newDate: string) {
		setSelectedDate(newDate);
		setCurrentPage(1);
	}

	function handleStatusChange(newStatus: SessionFilterStatus) {
		setStatus(newStatus);
		setCurrentPage(1);
	}

	function handleQueryChange(newQuery: string) {
		setQuery(newQuery);
		setCurrentPage(1);
	}

	function handlePageSizeChange(newSize: number) {
		setPageSize(newSize);
		setCurrentPage(1);
	}

	// Paginación
	const effectivePageSize = pageSize === 0 ? filteredSessions.length || 1 : pageSize;
	const totalPages = Math.max(1, Math.ceil(filteredSessions.length / effectivePageSize));
	const safePage = Math.min(currentPage, totalPages);

	const startIndex = (safePage - 1) * effectivePageSize;
	const endIndex = Math.min(startIndex + effectivePageSize, filteredSessions.length);
	const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

	return (
		<section className="space-y-4">
			{/* ── Controles de Filtros y Búsqueda ── */}
			<div className="flex flex-col gap-3.5">
				{/* Fila Superior: Título + Contador + Selector de Fecha + Estado + Buscador */}
				<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-bold tracking-tight text-foreground">
							Sesiones
						</h2>
						<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
							{filteredSessions.length}
						</span>
					</div>

					{/* ── Toolbar de Filtros perfectamente alineada ── */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full xl:w-auto">
						{/* 1. Selector de Fecha */}
						<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
							<PopoverTrigger
								render={
									<Button
										variant="outline"
										aria-label="Filtrar por fecha"
										className="h-9.5 min-w-[13.5rem] w-full sm:w-auto justify-between gap-2.5 rounded-xl border-border/80 bg-card px-3 text-xs font-semibold shadow-xs hover:border-primary/50 hover:bg-muted/40 transition-all"
									/>
								}
							>
								<div className="flex items-center gap-2 truncate">
									<CalendarIcon className="size-3.5 text-primary shrink-0" />
									<span className="truncate">{formatDisplayDate(selectedDate)}</span>
								</div>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 rounded-2xl" align="end">
								<div className="p-2 border-b flex items-center justify-between gap-1 bg-muted/30">
									<Button
										variant={selectedDate === todayStr ? "default" : "outline"}
										size="sm"
										className="text-xs h-7 px-2.5 font-bold rounded-lg"
										onClick={() => {
											handleDateChange(todayStr);
											setCalendarOpen(false);
										}}
									>
										Hoy
									</Button>
									<Button
										variant={selectedDate === yesterdayStr ? "default" : "outline"}
										size="sm"
										className="text-xs h-7 px-2.5 font-medium rounded-lg"
										onClick={() => {
											handleDateChange(yesterdayStr);
											setCalendarOpen(false);
										}}
									>
										Ayer
									</Button>
									<Button
										variant={selectedDate === "TODAS" ? "default" : "outline"}
										size="sm"
										className="text-xs h-7 px-2.5 font-medium rounded-lg"
										onClick={() => {
											handleDateChange("TODAS");
											setCalendarOpen(false);
										}}
									>
										Todas
									</Button>
								</div>
								<Calendar
									mode="single"
									selected={selectedDate !== "TODAS" ? parseDateString(selectedDate) : undefined}
									onSelect={(date) => {
										if (date) {
											handleDateChange(formatDateToParam(date));
											setCalendarOpen(false);
										}
									}}
								/>
							</PopoverContent>
						</Popover>

						{/* 2. Filtro por Estado */}
						<Select
							value={status}
							onValueChange={(value) =>
								handleStatusChange((value ?? "TODAS") as SessionFilterStatus)
							}
						>
							<SelectTrigger
								aria-label="Filtrar por estado"
								className="!h-9.5 min-w-[12rem] w-full sm:w-auto rounded-xl border-border/80 bg-card px-3 text-xs font-medium shadow-xs hover:border-primary/50 transition-all"
							>
								<SelectValue>
									{(value) =>
										statusLabels[value as SessionFilterStatus] ?? statusLabels.TODAS
									}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-xl">
								{(Object.keys(statusLabels) as SessionFilterStatus[]).map((option) => (
									<SelectItem key={option} value={option} className="text-xs rounded-lg">
										{statusLabels[option]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* 3. Búsqueda */}
						<div className="relative min-w-[13.5rem] w-full sm:w-auto">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
							<Input
								value={query}
								onChange={(event) => handleQueryChange(event.target.value)}
								placeholder="Buscar niño, acudiente..."
								aria-label="Buscar sesiones"
								className="!h-9.5 w-full pl-8.5 pr-3 rounded-xl border-border/80 bg-card text-xs shadow-xs hover:border-primary/50 transition-all"
							/>
						</div>
					</div>
				</div>

				{/* Accesos rápidos de fecha */}
				<div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
					<span className="font-semibold text-foreground/80 mr-1">Filtro rápido:</span>
					<button
						type="button"
						onClick={() => handleDateChange(todayStr)}
						className={cn(
							"rounded-xl px-3 py-1 transition-all font-medium border text-xs",
							selectedDate === todayStr
								? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
								: "bg-card hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground",
						)}
					>
						📅 Hoy
					</button>
					<button
						type="button"
						onClick={() => handleDateChange(yesterdayStr)}
						className={cn(
							"rounded-xl px-3 py-1 transition-all font-medium border text-xs",
							selectedDate === yesterdayStr
								? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
								: "bg-card hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground",
						)}
					>
						Ayer
					</button>
					<button
						type="button"
						onClick={() => handleDateChange("TODAS")}
						className={cn(
							"rounded-xl px-3 py-1 transition-all font-medium border text-xs",
							selectedDate === "TODAS"
								? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
								: "bg-card hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground",
						)}
					>
						Todas las fechas
					</button>
					{selectedDate !== todayStr && (
						<button
							type="button"
							onClick={() => handleDateChange(todayStr)}
							className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline ml-2"
						>
							<RotateCcw className="size-3" />
							Volver a hoy
						</button>
					)}
				</div>
			</div>

			{/* ── Lista de Tarjetas ── */}
			{filteredSessions.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
					<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-3">
						<SlidersHorizontal className="size-6" />
					</div>
					<p className="text-base font-semibold text-foreground">
						No hay sesiones para {selectedDate === "TODAS" ? "los filtros seleccionados" : `la fecha seleccionada (${formatDisplayDate(selectedDate)})`}
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						Prueba cambiando la fecha, el estado o limpiando el término de búsqueda.
					</p>
					{selectedDate !== todayStr && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSelectedDate(todayStr)}
							className="mt-4 gap-1.5"
						>
							<RotateCcw className="size-3.5" />
							Ver sesiones de Hoy
						</Button>
					)}
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
							onValueChange={(val) => handlePageSizeChange(Number(val))}
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

// ─── Helpers de Fecha, Categorización y Paginación ───────────────────────────
function getTodayString(): string {
	const now = new Date();
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Bogota",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}

function getYesterdayString(): string {
	const now = new Date();
	now.setDate(now.getDate() - 1);
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Bogota",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}

function getSessionDateString(isoString: string): string {
	const date = new Date(isoString);
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Bogota",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

function formatDisplayDate(dateStr: string): string {
	if (dateStr === "TODAS") return "Todas las fechas";
	const today = getTodayString();
	const yesterday = getYesterdayString();

	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	const formatted = new Intl.DateTimeFormat("es-CO", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(date);

	if (dateStr === today) return `Hoy, ${formatted}`;
	if (dateStr === yesterday) return `Ayer, ${formatted}`;
	return formatted;
}

function parseDateString(dateStr: string): Date | undefined {
	if (!dateStr || dateStr === "TODAS") return undefined;
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDateToParam(date: Date): string {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
}

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
