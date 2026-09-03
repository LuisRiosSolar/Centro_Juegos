import { db } from "@/db";
import {
	cliente,
	extensionTiempo,
	pago,
	planTiempo,
	responsable,
	sesionJuego,
	user,
} from "@/db/schema";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

export async function getActivePlans() {
	const plans = await db
		.select({
			id: planTiempo.id,
			nombre: planTiempo.nombre,
			minutos: planTiempo.minutos,
			precio: planTiempo.precio,
			activo: planTiempo.activo,
		})
		.from(planTiempo)
		.where(eq(planTiempo.activo, true))
		.orderBy(planTiempo.minutos);

	return plans.map((plan) => ({
		...plan,
		precio: plan.precio.toString(),
	}));
}

export async function getAllPlans() {
	const plans = await db
		.select({
			id: planTiempo.id,
			nombre: planTiempo.nombre,
			minutos: planTiempo.minutos,
			precio: planTiempo.precio,
			activo: planTiempo.activo,
		})
		.from(planTiempo)
		.orderBy(planTiempo.minutos);

	return plans.map((plan) => ({
		...plan,
		precio: plan.precio.toString(),
	}));
}

export async function getActiveGameSessions() {
	const sessions = await db
		.select({
			id: sesionJuego.id,
			fechaIngreso: sesionJuego.fechaIngreso,
			minutosTotales: sesionJuego.minutosTotales,
			estado: sesionJuego.estado,
			clienteNombre: cliente.nombreCompleto,
			clienteIdentificacion: cliente.identificacion,
			responsableNombre: responsable.nombreCompleto,
			responsableTelefono: responsable.telefono,
			planNombre: planTiempo.nombre,
			planMinutos: planTiempo.minutos,
			precio: planTiempo.precio,
			creadoPor: user.name,
		})
		.from(sesionJuego)
		.innerJoin(cliente, eq(sesionJuego.clienteId, cliente.id))
		.innerJoin(responsable, eq(cliente.responsableId, responsable.id))
		.innerJoin(planTiempo, eq(sesionJuego.planTiempoId, planTiempo.id))
		.innerJoin(user, eq(sesionJuego.creadoPor, user.id))
		.where(
			and(
				eq(sesionJuego.estado, "ACTIVA"),
				sql`${sesionJuego.fechaIngreso} + ${sesionJuego.minutosTotales} * interval '1 minute' > now()`,
			),
		)
		.orderBy(desc(sesionJuego.fechaIngreso));

	return sessions.map((session) => ({
		...session,
		fechaIngreso: session.fechaIngreso.toISOString(),
		precio: session.precio.toString(),
		planMinutos: session.planMinutos,
	}));
}

export async function getAdminGameSessions() {
	const sessions = await db
		.select({
			id: sesionJuego.id,
			fechaIngreso: sesionJuego.fechaIngreso,
			fechaSalida: sesionJuego.fechaSalida,
			minutosTotales: sesionJuego.minutosTotales,
			estado: sesionJuego.estado,
			clienteNombre: cliente.nombreCompleto,
			clienteIdentificacion: cliente.identificacion,
			responsableNombre: responsable.nombreCompleto,
			responsableTelefono: responsable.telefono,
			planNombre: planTiempo.nombre,
			planMinutos: planTiempo.minutos,
			precio: planTiempo.precio,
			creadoPor: user.name,
		})
		.from(sesionJuego)
		.innerJoin(cliente, eq(sesionJuego.clienteId, cliente.id))
		.innerJoin(responsable, eq(cliente.responsableId, responsable.id))
		.innerJoin(planTiempo, eq(sesionJuego.planTiempoId, planTiempo.id))
		.innerJoin(user, eq(sesionJuego.creadoPor, user.id))
		.orderBy(desc(sesionJuego.fechaIngreso));

	return sessions.map((session) => ({
		...session,
		fechaIngreso: session.fechaIngreso.toISOString(),
		fechaSalida: session.fechaSalida?.toISOString() ?? null,
		precio: session.precio.toString(),
		planMinutos: session.planMinutos,
	}));
}

export function getSessionMetrics(
	sessions: Awaited<ReturnType<typeof getActiveGameSessions>>,
) {
	return {
		activeCount: sessions.length,
		totalMinutes: sessions.reduce(
			(total, session) => total + session.minutosTotales,
			0,
		),
		activeCash: sessions.reduce(
			(total, session) => total + Number(session.precio),
			0,
		),
	};
}

export type FinancialReportItem = {
	id: string;
	fechaIngreso: string;
	fechaSalida: string | null;
	estado: "ACTIVA" | "FINALIZADA" | "CANCELADA";
	clienteNombre: string;
	clienteIdentificacion: string;
	responsableNombre: string;
	responsableTelefono: string;
	planNombre: string;
	tiempoInicialMinutos: number;
	valorSesion: number;
	tiempoAdicionalMinutos: number;
	valorAdicional: number;
	totalSesion: number;
	metodoPago: string;
	creadoPorNombre: string;
	adiciones: Array<{
		id: string;
		minutosAgregados: number;
		valor: number;
		createdAt: string;
	}>;
};

export type FinancialReportSummary = {
	totalIngresos: number;
	ingresosSesiones: number;
	ingresosAdicionales: number;
	totalSesiones: number;
	totalTiempoMinutos: number;
	totalAdiciones: number;
	desgloseMetodosPago: {
		EFECTIVO: number;
		NEQUI: number;
		DAVIPLATA: number;
		TRANSFERENCIA: number;
	};
};

export async function getSessionFinancialReport(
	startDateStr: string,
	endDateStr: string,
): Promise<{
	sessions: FinancialReportItem[];
	summary: FinancialReportSummary;
	startDate: string;
	endDate: string;
}> {
	// Parse local dates (Colombia UTC-5)
	const start = new Date(`${startDateStr}T00:00:00.000-05:00`);
	const end = new Date(`${endDateStr}T23:59:59.999-05:00`);

	const sessionRows = await db
		.select({
			id: sesionJuego.id,
			fechaIngreso: sesionJuego.fechaIngreso,
			fechaSalida: sesionJuego.fechaSalida,
			minutosTotales: sesionJuego.minutosTotales,
			estado: sesionJuego.estado,
			clienteNombre: cliente.nombreCompleto,
			clienteIdentificacion: cliente.identificacion,
			responsableNombre: responsable.nombreCompleto,
			responsableTelefono: responsable.telefono,
			planNombre: planTiempo.nombre,
			planMinutos: planTiempo.minutos,
			planPrecio: planTiempo.precio,
			creadoPorNombre: user.name,
		})
		.from(sesionJuego)
		.innerJoin(cliente, eq(sesionJuego.clienteId, cliente.id))
		.innerJoin(responsable, eq(cliente.responsableId, responsable.id))
		.innerJoin(planTiempo, eq(sesionJuego.planTiempoId, planTiempo.id))
		.innerJoin(user, eq(sesionJuego.creadoPor, user.id))
		.where(
			and(
				gte(sesionJuego.fechaIngreso, start),
				lte(sesionJuego.fechaIngreso, end),
			),
		)
		.orderBy(desc(sesionJuego.fechaIngreso));

	if (sessionRows.length === 0) {
		return {
			sessions: [],
			summary: {
				totalIngresos: 0,
				ingresosSesiones: 0,
				ingresosAdicionales: 0,
				totalSesiones: 0,
				totalTiempoMinutos: 0,
				totalAdiciones: 0,
				desgloseMetodosPago: {
					EFECTIVO: 0,
					NEQUI: 0,
					DAVIPLATA: 0,
					TRANSFERENCIA: 0,
				},
			},
			startDate: startDateStr,
			endDate: endDateStr,
		};
	}

	const sessionIds = sessionRows.map((s) => s.id);

	// Load payments and extensions for these sessions
	const [paymentRows, extensionRows] = await Promise.all([
		db
			.select({
				id: pago.id,
				sesionJuegoId: pago.sesionJuegoId,
				valor: pago.valor,
				metodoPago: pago.metodoPago,
				createdAt: pago.createdAt,
			})
			.from(pago)
			.where(inArray(pago.sesionJuegoId, sessionIds)),
		db
			.select({
				id: extensionTiempo.id,
				sesionJuegoId: extensionTiempo.sesionJuegoId,
				minutosAgregados: extensionTiempo.minutosAgregados,
				valor: extensionTiempo.valor,
				createdAt: extensionTiempo.createdAt,
			})
			.from(extensionTiempo)
			.where(inArray(extensionTiempo.sesionJuegoId, sessionIds))
			.orderBy(extensionTiempo.createdAt),
	]);

	const paymentsBySession = new Map<string, typeof paymentRows>();
	for (const p of paymentRows) {
		const existing = paymentsBySession.get(p.sesionJuegoId) ?? [];
		existing.push(p);
		paymentsBySession.set(p.sesionJuegoId, existing);
	}

	const extensionsBySession = new Map<string, typeof extensionRows>();
	for (const ext of extensionRows) {
		const existing = extensionsBySession.get(ext.sesionJuegoId) ?? [];
		existing.push(ext);
		extensionsBySession.set(ext.sesionJuegoId, existing);
	}

	let totalIngresos = 0;
	let ingresosSesiones = 0;
	let ingresosAdicionales = 0;
	let totalTiempoMinutos = 0;
	let totalAdiciones = 0;
	const desgloseMetodosPago = {
		EFECTIVO: 0,
		NEQUI: 0,
		DAVIPLATA: 0,
		TRANSFERENCIA: 0,
	};

	const sessions: FinancialReportItem[] = sessionRows.map((s) => {
		const sessionPayments = paymentsBySession.get(s.id) ?? [];
		const sessionExtensions = extensionsBySession.get(s.id) ?? [];
		const initialPayment = sessionPayments[0];
		const planPrice = Number(s.planPrecio);
		const planMinutes = s.planMinutos > 0 ? s.planMinutos : 60;
		const valorSesion = planPrice || (initialPayment ? Number(initialPayment.valor) : 0);

		const metodoPago = (initialPayment?.metodoPago ?? "EFECTIVO") as keyof typeof desgloseMetodosPago;

		// Extensions calculations reflecting plan rates
		let valorAdicional = 0;
		let tiempoAdicionalMinutos = 0;

		const adiciones = sessionExtensions.map((ext) => {
			let extVal = Number(ext.valor);
			if (ext.minutosAgregados > 0) {
				extVal = Math.round((planPrice / planMinutes) * ext.minutosAgregados);
				valorAdicional += extVal;
				tiempoAdicionalMinutos += ext.minutosAgregados;
			}

			return {
				id: ext.id,
				minutosAgregados: ext.minutosAgregados,
				valor: extVal,
				createdAt: ext.createdAt.toISOString(),
			};
		});

		const totalSesion = valorSesion + valorAdicional;

		// Accumulate metrics
		totalIngresos += totalSesion;
		ingresosSesiones += valorSesion;
		ingresosAdicionales += valorAdicional;
		totalTiempoMinutos += s.minutosTotales;
		totalAdiciones += adiciones.filter((a) => a.minutosAgregados > 0).length;

		if (desgloseMetodosPago[metodoPago] !== undefined) {
			desgloseMetodosPago[metodoPago] += totalSesion;
		}

		return {
			id: s.id,
			fechaIngreso: s.fechaIngreso.toISOString(),
			fechaSalida: s.fechaSalida?.toISOString() ?? null,
			estado: s.estado,
			clienteNombre: s.clienteNombre,
			clienteIdentificacion: s.clienteIdentificacion,
			responsableNombre: s.responsableNombre,
			responsableTelefono: s.responsableTelefono,
			planNombre: s.planNombre,
			tiempoInicialMinutos: s.planMinutos,
			valorSesion,
			tiempoAdicionalMinutos,
			valorAdicional,
			totalSesion,
			metodoPago,
			creadoPorNombre: s.creadoPorNombre,
			adiciones,
		};
	});

	return {
		sessions,
		summary: {
			totalIngresos,
			ingresosSesiones,
			ingresosAdicionales,
			totalSesiones: sessions.length,
			totalTiempoMinutos,
			totalAdiciones,
			desgloseMetodosPago,
		},
		startDate: startDateStr,
		endDate: endDateStr,
	};
}
