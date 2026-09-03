"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, ilike } from "drizzle-orm";

import { db } from "@/db";
import {
	cliente,
	extensionTiempo,
	pago,
	planTiempo,
	responsable,
	rol,
	sesionJuego,
	user,
} from "@/db/schema";
import { getAdminAccess } from "@/lib/admin-auth";
import {
	createPlanSchema,
	createSessionSchema,
	type CreatePlanValues,
	type CreateSessionValues,
} from "@/lib/session-schemas";
import { auth } from "@/lib/auth";

export type ActionResult =
	| { ok: true; message: string }
	| { ok: false; message: string };

export const createManagedUserSchema = z.object({
	name: z.string().trim().min(2, "El nombre es obligatorio."),
	email: z.string().trim().email("Ingresa un correo válido."),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
	role: z.enum(["user", "admin"]).default("user"),
});

export type CreateManagedUserValues = z.infer<typeof createManagedUserSchema>;

export async function createManagedUser(
	values: CreateManagedUserValues,
): Promise<ActionResult> {
	const access = await getAdminAccess();

	if (!access.ok) {
		return {
			ok: false,
			message:
				access.reason === "unauthenticated"
					? "Debes iniciar sesión."
					: "No tienes permisos para crear usuarios.",
		};
	}

	if (!access.isRoot) {
		return {
			ok: false,
			message: "Solo el super administrador puede crear usuarios.",
		};
	}

	const parsed = createManagedUserSchema.safeParse(values);

	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
		};
	}

	const normalizedEmail = parsed.data.email.toLowerCase();

	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, normalizedEmail))
		.limit(1);

	if (existing.length > 0) {
		return {
			ok: false,
			message: "Ya existe un usuario con ese correo.",
		};
	}

	const created = await auth.api.signUpEmail({
		asResponse: false,
		body: {
			email: normalizedEmail,
			name: parsed.data.name.trim(),
			password: parsed.data.password,
		},
		headers: undefined,
	});

	if (!created?.user) {
		return {
			ok: false,
			message: "No se pudo crear el usuario.",
		};
	}

	// Link roleId in db if role matches
	const targetRoleName = parsed.data.role.toUpperCase();
	const [roleRecord] = await db
		.select({ id: rol.id })
		.from(rol)
		.where(ilike(rol.nombre, targetRoleName))
		.limit(1);

	if (roleRecord && created.user.id) {
		await db
			.update(user)
			.set({ roleId: roleRecord.id })
			.where(eq(user.id, created.user.id));
	}

	revalidateAdminViews();
	return {
		ok: true,
		message: `Usuario creado correctamente para ${normalizedEmail}.`,
	};
}

export async function createPlan(
	values: CreatePlanValues,
): Promise<ActionResult> {
	const access = await getAdminAccess();

	if (!access.ok) return forbiddenResult(access.reason);

	const parsed = createPlanSchema.safeParse(values);
	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? "Datos inválidos",
		};
	}

	await db.insert(planTiempo).values({
		id: crypto.randomUUID(),
		nombre: parsed.data.nombre,
		minutos: parsed.data.minutos,
		precio: parsed.data.precio.toString(),
	});

	revalidateAdminViews();

	return { ok: true, message: "Plan creado correctamente." };
}

export async function createGameSession(
	values: CreateSessionValues,
): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	const parsed = createSessionSchema.safeParse(values);
	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? "Datos inválidos",
		};
	}

	const data = parsed.data;
	const [selectedPlan] = await db
		.select({
			id: planTiempo.id,
			minutos: planTiempo.minutos,
			precio: planTiempo.precio,
		})
		.from(planTiempo)
		.where(eq(planTiempo.id, data.planTiempoId))
		.limit(1);

	if (!selectedPlan) {
		return { ok: false, message: "Selecciona un plan válido." };
	}

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
	const sesionId = crypto.randomUUID();

	await db.insert(sesionJuego).values({
		id: sesionId,
		clienteId,
		planTiempoId: selectedPlan.id,
		minutosTotales: selectedPlan.minutos,
		creadoPor: access.userId,
	});

	await db.insert(pago).values({
		id: crypto.randomUUID(),
		sesionJuegoId: sesionId,
		valor: selectedPlan.precio.toString(),
		metodoPago: data.metodoPago,
		creadoPor: access.userId,
	});

	revalidateAdminViews();

	return { ok: true, message: "Sesión creada correctamente." };
}

export async function finishGameSession(
	sesionJuegoId: string,
): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	const [session] = await db
		.select({ id: sesionJuego.id, estado: sesionJuego.estado })
		.from(sesionJuego)
		.where(eq(sesionJuego.id, sesionJuegoId))
		.limit(1);

	if (!session) return { ok: false, message: "Sesión no encontrada." };
	if (session.estado !== "ACTIVA") {
		return { ok: false, message: "La sesión ya está terminada." };
	}

	await db
		.update(sesionJuego)
		.set({ estado: "FINALIZADA", fechaSalida: new Date() })
		.where(eq(sesionJuego.id, session.id));

	revalidateAdminViews();

	return { ok: true, message: "Sesión finalizada correctamente." };
}

export async function adjustSessionTime(
	sesionJuegoId: string,
	minutos: number,
): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	if (!Number.isInteger(minutos) || minutos === 0) {
		return { ok: false, message: "Ajuste de tiempo inválido." };
	}

	const [session] = await db
		.select({
			id: sesionJuego.id,
			fechaIngreso: sesionJuego.fechaIngreso,
			minutosTotales: sesionJuego.minutosTotales,
			estado: sesionJuego.estado,
		})
		.from(sesionJuego)
		.where(eq(sesionJuego.id, sesionJuegoId))
		.limit(1);

	if (!session) {
		return { ok: false, message: "Sesión no encontrada." };
	}

	const now = new Date();
	const endsAt =
		session.fechaIngreso.getTime() + session.minutosTotales * 60_000;
	const isFinished = session.estado !== "ACTIVA" || endsAt <= now.getTime();

	if (isFinished && minutos < 0) {
		return {
			ok: false,
			message: "No puedes restar tiempo a una sesión terminada.",
		};
	}

	if (minutos < 0 && session.minutosTotales + minutos < 1) {
		return {
			ok: false,
			message: "No puedes disminuir el tiempo por debajo de 1 minuto.",
		};
	}

	const nextMinutes = session.minutosTotales + minutos;
	const appliedDelta = nextMinutes - session.minutosTotales;

	if (appliedDelta === 0) {
		return { ok: false, message: "La sesión ya está en el mínimo permitido." };
	}

	const updateValues = isFinished
		? {
				fechaIngreso: new Date(now.getTime() - session.minutosTotales * 60_000),
				fechaSalida: null,
				minutosTotales: nextMinutes,
				estado: "ACTIVA" as const,
			}
		: { minutosTotales: nextMinutes };

	await db
		.update(sesionJuego)
		.set(updateValues)
		.where(eq(sesionJuego.id, session.id));

	await db.insert(extensionTiempo).values({
		id: crypto.randomUUID(),
		sesionJuegoId: session.id,
		minutosAgregados: appliedDelta,
		valor: "0",
		creadoPor: access.userId,
	});

	revalidateAdminViews();

	return {
		ok: true,
		message: isFinished ? "Sesión reanudada." : "Tiempo actualizado.",
	};
}

function forbiddenResult(
	reason: "unauthenticated" | "forbidden",
): ActionResult {
	return {
		ok: false,
		message:
			reason === "unauthenticated"
				? "Debes iniciar sesión."
				: "No tienes permisos de administrador.",
	};
}

function revalidateAdminViews() {
	revalidatePath("/admin");
	revalidatePath("/admin/planes");
	revalidatePath("/admin/usuarios");
	revalidatePath("/sesiones");
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
	await db.insert(responsable).values({ id, ...values });

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
	await db.insert(cliente).values({ id, ...values });

	return id;
}
