import { db } from "@/db";
import { cliente, planTiempo, responsable, sesionJuego, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type SessionOverviewRow = {
	id: string;
	fechaIngreso: Date;
	minutosTotales: number;
	clienteNombre: string;
	clienteIdentificacion: string;
	responsableNombre: string;
	responsableTelefono: string;
	planNombre: string;
	precio: string;
	creadoPor: string;
};

export async function getActiveSessionsOverview(): Promise<SessionOverviewRow[]> {
	const rows = await db
		.select({
			id: sesionJuego.id,
			fechaIngreso: sesionJuego.fechaIngreso,
			minutosTotales: sesionJuego.minutosTotales,
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
		.where(eq(sesionJuego.estado, "ACTIVA"))
		.orderBy(desc(sesionJuego.fechaIngreso));

	return rows.map((session) => ({
		...session,
		precio: session.precio.toString(),
		fechaIngreso: new Date(session.fechaIngreso),
	}));
}

export async function getSessionsByCreatorId(
	creatorUserId: string,
): Promise<SessionOverviewRow[]> {
	const rows = await db
		.select({
			id: sesionJuego.id,
			fechaIngreso: sesionJuego.fechaIngreso,
			minutosTotales: sesionJuego.minutosTotales,
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
		.where(eq(sesionJuego.creadoPor, creatorUserId))
		.orderBy(desc(sesionJuego.fechaIngreso));

	return rows.map((session) => ({
		...session,
		precio: session.precio.toString(),
		fechaIngreso: new Date(session.fechaIngreso),
	}));
}
