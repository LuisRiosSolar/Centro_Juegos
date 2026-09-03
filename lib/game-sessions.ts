import { db } from "@/db";
import {
	cliente,
	planTiempo,
	responsable,
	sesionJuego,
	user,
} from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getActivePlans() {
	const plans = await db
		.select({
			id: planTiempo.id,
			nombre: planTiempo.nombre,
			minutos: planTiempo.minutos,
			precio: planTiempo.precio,
		})
		.from(planTiempo)
		.where(eq(planTiempo.activo, true));

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
