import { pgEnum, pgTable, text, timestamp, integer, numeric, boolean, index, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const estadoSesion = pgEnum("estado_sesion", ["ACTIVA", "FINALIZADA", "CANCELADA"])
export const metodoPago = pgEnum("metodo_pago", ["EFECTIVO", "TRANSFERENCIA", "NEQUI", "DAVIPLATA"])


export const account = pgTable("account", {
	id: text().primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast()),
]);

export const cliente = pgTable("cliente", {
	id: text().primaryKey(),
	identificacion: text().notNull(),
	nombreCompleto: text("nombre_completo").notNull(),
	fechaNacimiento: timestamp("fecha_nacimiento"),
	responsableId: text("responsable_id").notNull().references(() => responsable.id),
	observaciones: text(),
	activo: boolean().default(true).notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
	unique("cliente_identificacion_key").on(table.identificacion),]);

export const extensionTiempo = pgTable("extension_tiempo", {
	id: text().primaryKey(),
	sesionJuegoId: text("sesion_juego_id").notNull().references(() => sesionJuego.id),
	minutosAgregados: integer("minutos_agregados").notNull(),
	valor: numeric().notNull(),
	creadoPor: text("creado_por").references(() => user.id),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const pago = pgTable("pago", {
	id: text().primaryKey(),
	sesionJuegoId: text("sesion_juego_id").notNull().references(() => sesionJuego.id),
	valor: numeric().notNull(),
	metodoPago: metodoPago("metodo_pago").notNull(),
	creadoPor: text("creado_por").references(() => user.id),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const planTiempo = pgTable("plan_tiempo", {
	id: text().primaryKey(),
	nombre: text().notNull(),
	minutos: integer().notNull(),
	precio: numeric().notNull(),
	activo: boolean().default(true).notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const responsable = pgTable("responsable", {
	id: text().primaryKey(),
	identificacion: text().notNull(),
	nombreCompleto: text("nombre_completo").notNull(),
	telefono: text().notNull(),
	correo: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
	unique("responsable_identificacion_key").on(table.identificacion),]);

export const rol = pgTable("rol", {
	id: text().primaryKey(),
	nombre: text().notNull(),
	descripcion: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
}, (table) => [
	unique("rol_nombre_key").on(table.nombre),]);

export const sesionJuego = pgTable("sesion_juego", {
	id: text().primaryKey(),
	clienteId: text("cliente_id").notNull().references(() => cliente.id),
	planTiempoId: text("plan_tiempo_id").notNull().references(() => planTiempo.id),
	fechaIngreso: timestamp("fecha_ingreso").default(sql`now()`).notNull(),
	fechaSalida: timestamp("fecha_salida"),
	minutosTotales: integer("minutos_totales").notNull(),
	estado: estadoSesion().default("ACTIVA").notNull(),
	creadoPor: text("creado_por").notNull().references(() => user.id),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const session = pgTable("session", {
	id: text().primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast()),
	unique("session_token_key").on(table.token),]);

export const user = pgTable("user", {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	roleId: text("role_id").references(() => rol.id),
}, (table) => [
	unique("user_email_key").on(table.email),]);

export const verification = pgTable("verification", {
	id: text().primaryKey(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast()),
]);
