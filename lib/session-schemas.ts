import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

const lettersOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const numbersOnlyRegex = /^\d+$/;

export const createSessionSchema = z.object({
	responsableIdentificacion: z
		.string()
		.trim()
		.min(1, "Ingresa la identificación del responsable")
		.regex(numbersOnlyRegex, "La identificación debe contener solo números")
		.min(4, "La identificación debe tener al menos 4 dígitos")
		.max(15, "La identificación no puede superar 15 dígitos"),
	responsableNombre: z
		.string()
		.trim()
		.min(1, "Ingresa el nombre del responsable")
		.regex(lettersOnlyRegex, "El nombre solo debe contener letras y espacios")
		.min(2, "El nombre debe tener al menos 2 caracteres"),
	responsableTelefono: z
		.string()
		.trim()
		.min(1, "Ingresa el teléfono del responsable")
		.regex(numbersOnlyRegex, "El teléfono debe contener solo números")
		.min(7, "El teléfono debe tener al menos 7 dígitos")
		.max(15, "El teléfono no puede superar 15 dígitos"),
	responsableCorreo: z.union([
		z.email("Ingresa un correo válido"),
		z.literal(""),
	]),
	clienteIdentificacion: z
		.string()
		.trim()
		.min(1, "Ingresa la identificación del jugador")
		.regex(numbersOnlyRegex, "La identificación debe contener solo números")
		.min(4, "La identificación debe tener al menos 4 dígitos")
		.max(15, "La identificación no puede superar 15 dígitos"),
	clienteNombre: z
		.string()
		.trim()
		.min(1, "Ingresa el nombre del jugador")
		.regex(lettersOnlyRegex, "El nombre solo debe contener letras y espacios")
		.min(2, "El nombre debe tener al menos 2 caracteres"),
	clienteFechaNacimiento: z.string(),
	clienteObservaciones: z.string(),
	planTiempoId: requiredText("Selecciona un plan"),
	metodoPago: z.enum(["EFECTIVO", "TRANSFERENCIA", "NEQUI", "DAVIPLATA"]),
});

export const createPlanSchema = z.object({
	nombre: requiredText("Ingresa el nombre del plan"),
	minutos: z.coerce
		.number("Ingresa los minutos")
		.int("Los minutos deben ser un número entero")
		.min(1, "Los minutos deben ser mayores a 0"),
	precio: z.coerce
		.number("Ingresa el valor")
		.min(0, "El valor no puede ser negativo"),
});

export type CreateSessionValues = z.infer<typeof createSessionSchema>;
export type CreatePlanValues = z.infer<typeof createPlanSchema>;

export const createSessionDefaults: CreateSessionValues = {
	responsableIdentificacion: "",
	responsableNombre: "",
	responsableTelefono: "",
	responsableCorreo: "",
	clienteIdentificacion: "",
	clienteNombre: "",
	clienteFechaNacimiento: "",
	clienteObservaciones: "",
	planTiempoId: "",
	metodoPago: "EFECTIVO",
};

export const createPlanDefaults: CreatePlanValues = {
	nombre: "",
	minutos: 60,
	precio: 0,
};
