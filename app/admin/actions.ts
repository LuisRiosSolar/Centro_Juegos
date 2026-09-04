"use server";

import { revalidatePath } from "next/cache";
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
	createManagedUserSchema,
	type ActionResult,
	type CreateManagedUserValues,
} from "@/lib/auth-schemas";
import {
	createPlanSchema,
	createSessionSchema,
	type CreatePlanValues,
	type CreateSessionValues,
} from "@/lib/session-schemas";
import { auth } from "@/lib/auth";

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

	try {
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

		// Link roleId in db
		const targetRoleName = parsed.data.role.toUpperCase();
		let [roleRecord] = await db
			.select({ id: rol.id })
			.from(rol)
			.where(ilike(rol.nombre, targetRoleName))
			.limit(1);

		if (!roleRecord) {
			const newRoleId = crypto.randomUUID();
			await db.insert(rol).values({
				id: newRoleId,
				nombre: targetRoleName,
				descripcion:
					targetRoleName === "SUPERADMIN"
						? "Super Administrador"
						: "Administrador",
			});
			roleRecord = { id: newRoleId };
		}

		if (roleRecord && created.user.id) {
			await db
				.update(user)
				.set({ roleId: roleRecord.id })
				.where(eq(user.id, created.user.id));
		}

		revalidateAdminViews();
		return {
			ok: true,
			message: `Usuario ${parsed.data.name.trim()} creado correctamente con rol ${targetRoleName === "SUPERADMIN" ? "Super Administrador" : "Administrador"}.`,
		};
	} catch (error) {
		const errorMsg =
			error instanceof Error ? error.message : "Error inesperado al crear usuario";
		return {
			ok: false,
			message: errorMsg,
		};
	}
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

export async function updatePlan(
	planId: string,
	values: CreatePlanValues,
): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	if (!access.isRoot) {
		return {
			ok: false,
			message: "Solo el super administrador puede editar planes.",
		};
	}

	const parsed = createPlanSchema.safeParse(values);
	if (!parsed.success) {
		return {
			ok: false,
			message: parsed.error.issues[0]?.message ?? "Datos inválidos",
		};
	}

	const [existing] = await db
		.select({ id: planTiempo.id })
		.from(planTiempo)
		.where(eq(planTiempo.id, planId))
		.limit(1);

	if (!existing) {
		return { ok: false, message: "El plan no existe." };
	}

	await db
		.update(planTiempo)
		.set({
			nombre: parsed.data.nombre,
			minutos: parsed.data.minutos,
			precio: parsed.data.precio.toString(),
		})
		.where(eq(planTiempo.id, planId));

	revalidateAdminViews();
	return { ok: true, message: "Plan actualizado correctamente." };
}

export async function togglePlanStatus(
	planId: string,
	activo: boolean,
): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	if (!access.isRoot) {
		return {
			ok: false,
			message: "Solo el super administrador puede modificar planes.",
		};
	}

	await db
		.update(planTiempo)
		.set({ activo })
		.where(eq(planTiempo.id, planId));

	revalidateAdminViews();
	return {
		ok: true,
		message: activo ? "Plan activado." : "Plan desactivado.",
	};
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
		return { ok: false, message: "La sesión ya no está activa." };
	}

	await db
		.update(sesionJuego)
		.set({ estado: "CANCELADA", fechaSalida: new Date() })
		.where(eq(sesionJuego.id, session.id));

	revalidateAdminViews();

	return { ok: true, message: "Sesión cancelada manualmente." };
}

export async function adjustSessionTime(
	sesionJuegoId: string,
	minutos: number,
): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	if (!Number.isInteger(minutos) || minutos <= 0) {
		return { ok: false, message: "Solo se permite agregar tiempo a las sesiones." };
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

	const nextMinutes = session.minutosTotales + minutos;
	const appliedDelta = nextMinutes - session.minutosTotales;

	if (appliedDelta <= 0) {
		return { ok: false, message: "Ajuste de tiempo no válido." };
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

	// Fetch plan details to calculate proportional extra charge
	const [sessionPlan] = await db
		.select({
			precio: planTiempo.precio,
			minutos: planTiempo.minutos,
		})
		.from(sesionJuego)
		.leftJoin(planTiempo, eq(sesionJuego.planTiempoId, planTiempo.id))
		.where(eq(sesionJuego.id, session.id))
		.limit(1);

	const planPrice = sessionPlan?.precio ? Number(sessionPlan.precio) : 0;
	const planMinutes = sessionPlan?.minutos && sessionPlan.minutos > 0 ? sessionPlan.minutos : 60;
	const calculatedExtraValue = appliedDelta > 0
		? Math.round((planPrice / planMinutes) * appliedDelta)
		: 0;

	await db.insert(extensionTiempo).values({
		id: crypto.randomUUID(),
		sesionJuegoId: session.id,
		minutosAgregados: appliedDelta,
		valor: calculatedExtraValue.toString(),
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

export async function syncAccountingData(): Promise<ActionResult> {
	const access = await getAdminAccess();
	if (!access.ok) return forbiddenResult(access.reason);

	if (!access.isRoot) {
		return {
			ok: false,
			message: "Solo el super administrador puede actualizar la contabilidad.",
		};
	}

	revalidateAdminViews();

	return {
		ok: true,
		message: "Actualización Exitosa",
	};
}

function revalidateAdminViews() {
	revalidatePath("/admin");
	revalidatePath("/admin/planes");
	revalidatePath("/admin/usuarios");
	revalidatePath("/admin/reportes");
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
