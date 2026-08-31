"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
	cliente,
	pago,
	planTiempo,
	responsable,
	sesionJuego,
	user,
} from "@/db/schema";
import { getAdminAccess } from "@/lib/admin-auth";
import {
	createSessionSchema,
	type CreateSessionValues,
} from "@/lib/session-schemas";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const createManagedUserSchema = z.object({
	name: z.string().trim().min(2, "El nombre es obligatorio."),
	email: z.email("Ingresa un correo válido."),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
	role: z.enum(["user", "admin"]).default("user"),
});

export type CreateManagedUserValues = z.infer<typeof createManagedUserSchema>;

export type CreateSessionResult =
	| { ok: true; message: string }
	| { ok: false; message: string };

export async function createManagedUser(
	values: CreateManagedUserValues,
): Promise<CreateSessionResult> {
	const access = await getAdminAccess();

	if (!access.ok) {
		return {
			ok: false,
			message: access.reason === "unauthenticated" ? "Debes iniciar sesión." : "No tienes permisos para crear usuarios.",
		};
	}

	if (!access.isRoot) {
		return {
			ok: false,
			message: "Solo el usuario raíz puede crear usuarios.",
		};
	}

	const parsed = createManagedUserSchema.safeParse(values);

	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
		};
	}

	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, parsed.data.email.toLowerCase()))
		.limit(1);

	if (existing.length > 0) {
		return {
			ok: false,
			message: "Ya existe un usuario con ese correo.",
		};
	}

	const created = await auth.api.createUser({
		asResponse: false,
		body: {
			email: parsed.data.email.toLowerCase(),
			name: parsed.data.name.trim(),
			password: parsed.data.password,
			role: parsed.data.role,
		},
		headers: undefined,
	});

	if (!created?.user) {
		return {
			ok: false,
			message: "No se pudo crear el usuario.",
		};
	}

	revalidatePath("/admin");
	return {
		ok: true,
		message: `Usuario creado correctamente para ${parsed.data.email.toLowerCase()}.`,
	};
}

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
