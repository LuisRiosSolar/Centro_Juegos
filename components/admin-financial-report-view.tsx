"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	CalendarDaysIcon,
	FileSpreadsheetIcon,
	Gamepad2Icon,
	HourglassIcon,
	LayersIcon,
	PrinterIcon,
	ReceiptTextIcon,
	RotateCcwIcon,
	SearchIcon,
	SparklesIcon,
	TrendingUpIcon,
	WalletCardsIcon,
} from "lucide-react";
import { toast } from "sonner";

import { syncAccountingData } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	FinancialReportItem,
	FinancialReportSummary,
} from "@/lib/game-sessions";
import { cn } from "@/lib/utils";

export function AdminFinancialReportView({
	initialSessions,
	initialSummary,
	initialStartDate,
	initialEndDate,
	isRoot = false,
}: {
	initialSessions: FinancialReportItem[];
	initialSummary: FinancialReportSummary;
	initialStartDate: string;
	initialEndDate: string;
	isRoot?: boolean;
}) {
	const router = useRouter();
	const [startDate, setStartDate] = useState(initialStartDate);
	const [endDate, setEndDate] = useState(initialEndDate);
	const [query, setQuery] = useState("");
	const [methodFilter, setMethodFilter] = useState<string>("ALL");
	const [isPending, startTransition] = useTransition();

	function applyDateFilter(desde: string, hasta: string) {
		setStartDate(desde);
		setEndDate(hasta);
		router.push(`/admin/reportes?desde=${desde}&hasta=${hasta}`);
		router.refresh();
	}

	function resetFilters() {
		const now = new Date();
		const pad = (n: number) => n.toString().padStart(2, "0");
		const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

		setQuery("");
		setMethodFilter("ALL");
		setStartDate(today);
		setEndDate(today);
		router.push(`/admin/reportes?desde=${today}&hasta=${today}`);
		router.refresh();
		toast.success("Filtros restablecidos y listado actualizado.");
	}

	function handleSyncAccounting() {
		startTransition(async () => {
			const result = await syncAccountingData();
			if (result.ok) {
				toast.success(result.message);
				router.refresh();
			} else {
				toast.error(result.message);
			}
		});
	}

	function setPreset(preset: "hoy" | "ayer" | "semana" | "mes") {
		const now = new Date();
		const pad = (n: number) => n.toString().padStart(2, "0");
		const formatDate = (d: Date) =>
			`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

		if (preset === "hoy") {
			const today = formatDate(now);
			applyDateFilter(today, today);
		} else if (preset === "ayer") {
			const yesterday = new Date(now);
			yesterday.setDate(yesterday.getDate() - 1);
			const yStr = formatDate(yesterday);
			applyDateFilter(yStr, yStr);
		} else if (preset === "semana") {
			const firstDay = new Date(now);
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
			firstDay.setDate(diff);
			applyDateFilter(formatDate(firstDay), formatDate(now));
		} else if (preset === "mes") {
			const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
			applyDateFilter(formatDate(firstDay), formatDate(now));
		}
	}

	const filteredSessions = useMemo(() => {
		const normalized = query.trim().toLowerCase();

		return initialSessions.filter((s) => {
			const matchesMethod =
				methodFilter === "ALL" || s.metodoPago === methodFilter;
			const matchesQuery =
				!normalized ||
				s.clienteNombre.toLowerCase().includes(normalized) ||
				s.clienteIdentificacion.toLowerCase().includes(normalized) ||
				s.responsableNombre.toLowerCase().includes(normalized) ||
				s.planNombre.toLowerCase().includes(normalized);

			return matchesMethod && matchesQuery;
		});
	}, [initialSessions, query, methodFilter]);

	// Export to CSV
	function exportToCSV() {
		if (filteredSessions.length === 0) return;

		const headers = [
			"ID Sesion",
			"Fecha",
			"Hora Inicio",
			"Hora Salida",
			"Estado",
			"Cliente",
			"Documento",
			"Responsable",
			"Telefono",
			"Plan",
			"Tiempo Inicial (min)",
			"Valor Sesion (COP)",
			"Tiempo Adicional (min)",
			"Valor Adicional (COP)",
			"Total Sesion (COP)",
			"Metodo Pago",
			"Operador",
		];

		const rows = filteredSessions.map((s) => [
			`"${s.id}"`,
			`"${formatDateOnly(s.fechaIngreso)}"`,
			`"${formatTimeOnly(s.fechaIngreso)}"`,
			`"${s.fechaSalida ? formatTimeOnly(s.fechaSalida) : s.estado}"`,
			`"${s.estado}"`,
			`"${s.clienteNombre}"`,
			`"${s.clienteIdentificacion}"`,
			`"${s.responsableNombre}"`,
			`"${s.responsableTelefono}"`,
			`"${s.planNombre}"`,
			s.tiempoInicialMinutos,
			s.valorSesion,
			s.tiempoAdicionalMinutos,
			s.valorAdicional,
			s.totalSesion,
			`"${s.metodoPago}"`,
			`"${s.creadoPorNombre}"`,
		]);

		const csvContent =
			"data:text/csv;charset=utf-8,\uFEFF" +
			[headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute(
			"download",
			`cierre_sesiones_${startDate}_al_${endDate}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function handlePrint() {
		window.print();
	}

	const hours = Math.floor(initialSummary.totalTiempoMinutos / 60);
	const mins = initialSummary.totalTiempoMinutos % 60;
	const formattedDuration = `${hours}h ${mins > 0 ? `${mins}m` : ""}`;

	return (
		<div className="flex flex-col gap-6">
			{/* Controls and Date Range Filter */}
			<Card className="border-border/70 bg-card shadow-xs print:hidden">
				<CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
					{/* Quick Presets & Reset */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
							Período:
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPreset("hoy")}
						>
							Hoy
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPreset("ayer")}
						>
							Ayer
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPreset("semana")}
						>
							Esta semana
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPreset("mes")}
						>
							Este mes
						</Button>

						<Button
							variant="secondary"
							size="sm"
							onClick={resetFilters}
							className="gap-1.5 ml-1"
						>
							<RotateCcwIcon className="size-3.5" />
							Limpiar filtros
						</Button>
					</div>

					{/* Custom Range Picker and Actions */}
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2">
							<Input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-38 text-xs sm:text-sm"
								aria-label="Fecha inicio"
							/>
							<span className="text-xs text-muted-foreground">a</span>
							<Input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-38 text-xs sm:text-sm"
								aria-label="Fecha fin"
							/>
							<Button
								size="sm"
								onClick={() => applyDateFilter(startDate, endDate)}
							>
								<CalendarDaysIcon className="size-4 mr-1" />
								Consultar
							</Button>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={exportToCSV}
								disabled={filteredSessions.length === 0}
							>
								<FileSpreadsheetIcon className="size-4 mr-1 text-emerald-500" />
								Exportar CSV
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handlePrint}
							>
								<PrinterIcon className="size-4 mr-1" />
								Imprimir
							</Button>

							{/* Superadmin Sync Accounting Button */}
							{isRoot ? (
								<Button
									variant="outline"
									size="sm"
									disabled={isPending}
									onClick={handleSyncAccounting}
									className="border-primary/40 text-primary hover:bg-primary/10 transition-all gap-1.5"
								>
									<SparklesIcon className={cn("size-3.5", isPending && "animate-spin")} />
									{isPending ? "Actualizando..." : "Actualizar Contabilidad"}
								</Button>
							) : null}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Top Summary KPI Cards */}
			<section
				aria-label="Resumen de ingresos y operaciones"
				className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
			>
				{/* Main Revenue Card */}
				<Card className="border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 shadow-sm sm:col-span-2 lg:col-span-1">
					<CardContent className="flex flex-col justify-between p-5 space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-xs font-bold uppercase tracking-wider text-primary">
								Total Ingresos del Período
							</p>
							<TrendingUpIcon className="size-5 text-primary" />
						</div>
						<div>
							<p className="text-3xl font-black tracking-tight text-foreground tabular-nums">
								${initialSummary.totalIngresos.toLocaleString("es-CO")} <span className="text-sm font-semibold text-muted-foreground">COP</span>
							</p>
							<div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/60">
								<span>Planes base: <strong className="text-foreground">${initialSummary.ingresosSesiones.toLocaleString("es-CO")}</strong></span>
								<span>Adiciones: <strong className="text-foreground">${initialSummary.ingresosAdicionales.toLocaleString("es-CO")}</strong></span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Sessions Count Card */}
				<Card className="border-border/70 bg-card shadow-xs">
					<CardContent className="flex flex-col justify-between p-5 space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Sesiones Realizadas
							</p>
							<Gamepad2Icon className="size-5 text-muted-foreground" />
						</div>
						<div>
							<p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
								{initialSummary.totalSesiones}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Turnos iniciados en el rango
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Total Time Sold Card */}
				<Card className="border-border/70 bg-card shadow-xs">
					<CardContent className="flex flex-col justify-between p-5 space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Tiempo Total Vendido
							</p>
							<HourglassIcon className="size-5 text-muted-foreground" />
						</div>
						<div>
							<p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
								{formattedDuration}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{initialSummary.totalTiempoMinutos} minutos acumulados
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Extra Time Additions Card */}
				<Card className="border-border/70 bg-card shadow-xs">
					<CardContent className="flex flex-col justify-between p-5 space-y-2">
						<div className="flex items-center justify-between">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Adiciones de Tiempo
							</p>
							<LayersIcon className="size-5 text-muted-foreground" />
						</div>
						<div>
							<p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
								{initialSummary.totalAdiciones}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Cobros por tiempo extra agregado
							</p>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Payment Methods Breakdown Bar */}
			<Card className="border-border/70 bg-card shadow-xs">
				<CardHeader className="pb-2 pt-4 px-5">
					<div className="flex items-center gap-2">
						<WalletCardsIcon className="size-4 text-primary" />
						<CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
							Desglose por Métodos de Pago
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-3 px-5 pb-4 sm:grid-cols-4">
					<div className="rounded-xl bg-muted/60 p-3">
						<p className="text-xs text-muted-foreground">Efectivo</p>
						<p className="text-lg font-bold text-foreground tabular-nums mt-0.5">
							${initialSummary.desgloseMetodosPago.EFECTIVO.toLocaleString("es-CO")}
						</p>
					</div>
					<div className="rounded-xl bg-muted/60 p-3">
						<p className="text-xs text-muted-foreground">Nequi</p>
						<p className="text-lg font-bold text-foreground tabular-nums mt-0.5">
							${initialSummary.desgloseMetodosPago.NEQUI.toLocaleString("es-CO")}
						</p>
					</div>
					<div className="rounded-xl bg-muted/60 p-3">
						<p className="text-xs text-muted-foreground">Daviplata</p>
						<p className="text-lg font-bold text-foreground tabular-nums mt-0.5">
							${initialSummary.desgloseMetodosPago.DAVIPLATA.toLocaleString("es-CO")}
						</p>
					</div>
					<div className="rounded-xl bg-muted/60 p-3">
						<p className="text-xs text-muted-foreground">Transferencia</p>
						<p className="text-lg font-bold text-foreground tabular-nums mt-0.5">
							${initialSummary.desgloseMetodosPago.TRANSFERENCIA.toLocaleString("es-CO")}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Detailed Sessions Table */}
			<Card className="border-border/70 bg-card shadow-xs">
				<CardHeader className="space-y-3 p-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div className="flex items-center gap-2">
								<ReceiptTextIcon className="size-5 text-primary" />
								<CardTitle className="text-xl font-bold tracking-tight text-foreground">
									Detalle de Sesiones Cobradas
								</CardTitle>
							</div>
							<CardDescription className="mt-1 text-sm text-muted-foreground">
								Mostrando {filteredSessions.length} de {initialSessions.length} sesiones registradas entre {startDate} y {endDate}.
							</CardDescription>
						</div>

						<div className="flex flex-wrap items-center gap-2.5 print:hidden">
							<Select value={methodFilter} onValueChange={(val) => setMethodFilter(val ?? "ALL")}>
								<SelectTrigger className="w-40 text-xs">
									<SelectValue placeholder="Método de pago" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">Todos los métodos</SelectItem>
									<SelectItem value="EFECTIVO">Efectivo</SelectItem>
									<SelectItem value="NEQUI">Nequi</SelectItem>
									<SelectItem value="DAVIPLATA">Daviplata</SelectItem>
									<SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
								</SelectContent>
							</Select>

							<div className="relative">
								<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Buscar jugador o plan..."
									className="w-56 pl-9 text-xs"
								/>
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-0">
					{filteredSessions.length === 0 ? (
						<div className="rounded-b-xl border-t border-dashed border-border py-16 text-center text-sm text-muted-foreground">
							No hay sesiones registradas en el período seleccionado.
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-y border-border/60">
									<tr>
										<th className="px-4 py-3">Fecha / Hora</th>
										<th className="px-4 py-3">Cliente</th>
										<th className="px-4 py-3">Plan</th>
										<th className="px-4 py-3 text-right">Valor Base</th>
										<th className="px-4 py-3 text-center">Tiempo Extra</th>
										<th className="px-4 py-3 text-right">Valor Extra</th>
										<th className="px-4 py-3 text-right font-bold text-foreground">Total Sesión</th>
										<th className="px-4 py-3 text-center">Pago</th>
										<th className="px-4 py-3">Operador</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/60">
									{filteredSessions.map((s) => (
										<tr
											key={s.id}
											className="hover:bg-muted/30 transition-colors"
										>
											<td className="px-4 py-3.5 whitespace-nowrap">
												<p className="font-semibold text-foreground">
													{formatDateOnly(s.fechaIngreso)}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatTimeOnly(s.fechaIngreso)}
													{s.fechaSalida ? ` - ${formatTimeOnly(s.fechaSalida)}` : " (En curso)"}
												</p>
											</td>
											<td className="px-4 py-3.5">
												<p className="font-semibold text-foreground">
													{s.clienteNombre}
												</p>
												<p className="text-xs text-muted-foreground">
													ID: {s.clienteIdentificacion}
												</p>
											</td>
											<td className="px-4 py-3.5 whitespace-nowrap">
												<span className="font-medium text-foreground">
													{s.planNombre}
												</span>
												<p className="text-xs text-muted-foreground">
													{s.tiempoInicialMinutos} min
												</p>
											</td>
											<td className="px-4 py-3.5 text-right font-medium tabular-nums text-foreground">
												${s.valorSesion.toLocaleString("es-CO")}
											</td>
											<td className="px-4 py-3.5 text-center whitespace-nowrap">
												{s.tiempoAdicionalMinutos > 0 ? (
													<span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
														+{s.tiempoAdicionalMinutos} min ({s.adiciones.length})
													</span>
												) : (
													<span className="text-xs text-muted-foreground">—</span>
												)}
											</td>
											<td className="px-4 py-3.5 text-right font-medium tabular-nums text-foreground">
												{s.valorAdicional > 0 ? (
													`+$${s.valorAdicional.toLocaleString("es-CO")}`
												) : (
													<span className="text-muted-foreground">$0</span>
												)}
											</td>
											<td className="px-4 py-3.5 text-right font-black text-base tabular-nums text-primary">
												${s.totalSesion.toLocaleString("es-CO")}
											</td>
											<td className="px-4 py-3.5 text-center whitespace-nowrap">
												<span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
													{s.metodoPago}
												</span>
											</td>
											<td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
												{s.creadoPorNombre}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot className="bg-muted/70 font-bold border-t-2 border-border text-foreground">
									<tr>
										<td colSpan={3} className="px-4 py-3 text-right">
											TOTALES DEL FILTRO ({filteredSessions.length} sesiones):
										</td>
										<td className="px-4 py-3 text-right tabular-nums">
											${filteredSessions.reduce((acc, s) => acc + s.valorSesion, 0).toLocaleString("es-CO")}
										</td>
										<td className="px-4 py-3 text-center tabular-nums">
											+{filteredSessions.reduce((acc, s) => acc + s.tiempoAdicionalMinutos, 0)} min
										</td>
										<td className="px-4 py-3 text-right tabular-nums">
											${filteredSessions.reduce((acc, s) => acc + s.valorAdicional, 0).toLocaleString("es-CO")}
										</td>
										<td className="px-4 py-3 text-right text-base font-black text-primary tabular-nums">
											${filteredSessions.reduce((acc, s) => acc + s.totalSesion, 0).toLocaleString("es-CO")}
										</td>
										<td colSpan={2}></td>
									</tr>
								</tfoot>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function formatDateOnly(isoString: string) {
	return new Intl.DateTimeFormat("es-CO", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		timeZone: "America/Bogota",
	}).format(new Date(isoString));
}

function formatTimeOnly(isoString: string) {
	return new Intl.DateTimeFormat("es-CO", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Bogota",
	}).format(new Date(isoString));
}
