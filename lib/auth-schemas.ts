import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().trim().email("Ingresa un correo válido"),
	password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z
	.object({
		name: z.string().trim().min(2, "Ingresa tu nombre"),
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
	name: z.string().trim().min(2, "El nombre es obligatorio."),
	email: z.string().trim().email("Ingresa un correo válido."),
	password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
	role: z.enum(["admin", "superadmin"]).default("admin"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CreateManagedUserValues = z.infer<typeof createManagedUserSchema>;

export type ActionResult =
	| { ok: true; message: string }
	| { ok: false; message: string };
