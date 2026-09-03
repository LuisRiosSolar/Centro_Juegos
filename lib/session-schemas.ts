import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const createSessionSchema = z.object({
	responsableIdentificacion: requiredText(
		"Ingresa la identificación del responsable",
	),
	responsableNombre: requiredText("Ingresa el nombre del responsable"),
	responsableTelefono: requiredText("Ingresa el teléfono del responsable"),
	responsableCorreo: z.union([
		z.email("Ingresa un correo válido"),
		z.literal(""),
	]),
	clienteIdentificacion: requiredText("Ingresa la identificación del jugador"),
	clienteNombre: requiredText("Ingresa el nombre del jugador"),
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
