import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Ingresa un correo válido"),
	password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z
	.object({
		name: z.string().trim().min(2, "Ingresa tu nombre"),
		email: z.email("Ingresa un correo válido"),
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z.string().min(1, "Confirma tu contraseña"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
