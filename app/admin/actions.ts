"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
	cliente,
	pago,
	planTiempo,
	responsable,
	sesionJuego,
} from "@/db/schema";
import { getAdminAccess } from "@/lib/admin-auth";
import {
	createSessionSchema,
	type CreateSessionValues,
} from "@/lib/session-schemas";
import { eq } from "drizzle-orm";

export type CreateSessionResult =
	| { ok: true; message: string }
	| { ok: false; message: string };

export async function createGameSession(
	values: CreateSessionValues,
): Promise<CreateSessionResult> {
	const access = await getAdminAccess();

	if (!access.ok) {
		return {
			ok: false,
			message:
				access.reason === "unauthenticated"
					? "Debes iniciar sesión."
					: "No tienes permisos de administrador.",
		};
	}

	const parsed = createSessionSchema.safeParse(values);

	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? "Datos inválidos",
		};
	}

	const data = parsed.data;
	const responsableId = await upsertResponsable({
		identificacion: data.responsableIdentificacion,
		nombreCompleto: data.responsableNombre,
		telefono: data.responsableTelefono,
		correo: data.responsableCorreo || null,
	});
	const clienteId = await upsertCliente({
		identificacion: data.clienteIdentificacion,
		nombreCompleto: data.clienteNombre,
		fechaNacimiento: data.clienteFechaNacimiento
			? new Date(`${data.clienteFechaNacimiento}T00:00:00`)
			: null,
		responsableId,
		observaciones: data.clienteObservaciones || null,
	});
	const planId = crypto.randomUUID();
	const sesionId = crypto.randomUUID();

	await db.insert(planTiempo).values({
		id: planId,
		nombre: data.planNombre,
		minutos: data.minutos,
		precio: data.precio.toString(),
	});

	await db.insert(sesionJuego).values({
		id: sesionId,
		clienteId,
		planTiempoId: planId,
		minutosTotales: data.minutos,
		creadoPor: access.userId,
	});

	await db.insert(pago).values({
		id: crypto.randomUUID(),
		sesionJuegoId: sesionId,
		valor: data.precio.toString(),
		metodoPago: data.metodoPago,
		creadoPor: access.userId,
	});

	revalidatePath("/admin");

	return { ok: true, message: "Sesión creada correctamente." };
}

async function upsertResponsable(values: {
	identificacion: string;
	nombreCompleto: string;
	telefono: string;
	correo: string | null;
}) {
	const [existing] = await db
		.select({ id: responsable.id })
		.from(responsable)
		.where(eq(responsable.identificacion, values.identificacion))
		.limit(1);

	if (existing) {
		await db
			.update(responsable)
			.set({
				nombreCompleto: values.nombreCompleto,
				telefono: values.telefono,
				correo: values.correo,
			})
			.where(eq(responsable.id, existing.id));

		return existing.id;
	}

	const id = crypto.randomUUID();

	await db.insert(responsable).values({
		id,
		...values,
	});

	return id;
}

async function upsertCliente(values: {
	identificacion: string;
	nombreCompleto: string;
	fechaNacimiento: Date | null;
	responsableId: string;
	observaciones: string | null;
}) {
	const [existing] = await db
		.select({ id: cliente.id })
		.from(cliente)
		.where(eq(cliente.identificacion, values.identificacion))
		.limit(1);

	if (existing) {
		await db
			.update(cliente)
			.set({
				nombreCompleto: values.nombreCompleto,
				fechaNacimiento: values.fechaNacimiento,
				responsableId: values.responsableId,
				observaciones: values.observaciones,
				activo: true,
			})
			.where(eq(cliente.id, existing.id));

		return existing.id;
	}

	const id = crypto.randomUUID();

	await db.insert(cliente).values({
		id,
		...values,
	});

	return id;
}
