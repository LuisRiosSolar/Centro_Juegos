import { z } from "zod";

const lettersOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export const loginSchema = z.object({
	email: z.string().trim().email("Ingresa un correo válido"),
	password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, "Ingresa tu nombre")
			.regex(lettersOnlyRegex, "El nombre solo puede contener letras y espacios"),
		email: z.string().trim().email("Ingresa un correo válido"),
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z.string().min(1, "Confirma tu contraseña"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

export const createManagedUserSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres.")
		.regex(lettersOnlyRegex, "El nombre solo puede contener letras y espacios."),
	email: z.string().trim().email("Ingresa un correo válido."),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
	role: z.enum(["admin", "superadmin"]).default("admin"),
});

export const updateManagedUserSchema = z.object({
	userId: z.string().min(1, "ID de usuario requerido"),
	name: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres.")
		.regex(lettersOnlyRegex, "El nombre solo puede contener letras y espacios."),
	email: z.string().trim().email("Ingresa un correo válido."),
	role: z.enum(["admin", "superadmin"]).default("admin"),
	newPassword: z
		.string()
		.refine((val) => val === "" || val.length >= 8, {
			message: "La nueva contraseña debe tener al menos 8 caracteres.",
		})
		.optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CreateManagedUserValues = z.infer<typeof createManagedUserSchema>;
export type UpdateManagedUserValues = z.infer<typeof updateManagedUserSchema>;

export type ActionResult =
	| { ok: true; message: string }
	| { ok: false; message: string };
