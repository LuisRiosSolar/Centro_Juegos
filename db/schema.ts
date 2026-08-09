import { defineRelations } from "drizzle-orm";

import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const estadoSesionEnum = pgEnum("estado_sesion", [
  "ACTIVA",
  "FINALIZADA",
  "CANCELADA",
]);

export const metodoPagoEnum = pgEnum("metodo_pago", [
  "EFECTIVO",
  "TRANSFERENCIA",
  "NEQUI",
  "DAVIPLATA",
]);

export const rol = pgTable("rol", {
  id: text("id").primaryKey(),

  nombre: text("nombre").notNull().unique(),

  descripcion: text("descripcion"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  roleId: text("role_id").references(() => rol.id),
});

export const responsable = pgTable("responsable", {
  id: text("id").primaryKey(),

  identificacion: text("identificacion").notNull().unique(),

  nombreCompleto: text("nombre_completo").notNull(),

  telefono: text("telefono").notNull(),

  correo: text("correo"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cliente = pgTable("cliente", {
  id: text("id").primaryKey(),

  identificacion: text("identificacion").notNull().unique(),

  nombreCompleto: text("nombre_completo").notNull(),

  fechaNacimiento: timestamp("fecha_nacimiento"),

  responsableId: text("responsable_id")
    .notNull()
    .references(() => responsable.id),

  observaciones: text("observaciones"),

  activo: boolean("activo").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const planTiempo = pgTable("plan_tiempo", {
  id: text("id").primaryKey(),

  nombre: text("nombre").notNull(),

  minutos: integer("minutos").notNull(),

  precio: numeric("precio").notNull(),

  activo: boolean("activo").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sesionJuego = pgTable("sesion_juego", {
  id: text("id").primaryKey(),

  clienteId: text("cliente_id")
    .notNull()
    .references(() => cliente.id),

  planTiempoId: text("plan_tiempo_id")
    .notNull()
    .references(() => planTiempo.id),

  fechaIngreso: timestamp("fecha_ingreso").defaultNow().notNull(),

  fechaSalida: timestamp("fecha_salida"),

  minutosTotales: integer("minutos_totales").notNull(),

  estado: estadoSesionEnum("estado").default("ACTIVA").notNull(),

  creadoPor: text("creado_por")
    .notNull()
    .references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pago = pgTable("pago", {
  id: text("id").primaryKey(),

  sesionJuegoId: text("sesion_juego_id")
    .notNull()
    .references(() => sesionJuego.id),

  valor: numeric("valor").notNull(),

  metodoPago: metodoPagoEnum("metodo_pago").notNull(),

  creadoPor: text("creado_por").references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const extensionTiempo = pgTable("extension_tiempo", {
  id: text("id").primaryKey(),

  sesionJuegoId: text("sesion_juego_id")
    .notNull()
    .references(() => sesionJuego.id),

  minutosAgregados: integer("minutos_agregados").notNull(),

  valor: numeric("valor").notNull(),

  creadoPor: text("creado_por").references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const schema = {
  rol,
  user,
  session,
  account,
  verification,
  responsable,
  cliente,
  planTiempo,
  sesionJuego,
  pago,
  extensionTiempo,
};
export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),

    rol: r.one.rol({
      from: r.user.roleId,
      to: r.rol.id,
    }),
  },

  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },

  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },

  rol: {
    users: r.many.user(),
  },

  cliente: {
    responsable: r.one.responsable({
      from: r.cliente.responsableId,
      to: r.responsable.id,
    }),
  },

  responsable: {
    clientes: r.many.cliente(),
  },

  sesionJuego: {
    cliente: r.one.cliente({
      from: r.sesionJuego.clienteId,
      to: r.cliente.id,
    }),

    planTiempo: r.one.planTiempo({
      from: r.sesionJuego.planTiempoId,
      to: r.planTiempo.id,
    }),

    usuario: r.one.user({
      from: r.sesionJuego.creadoPor,
      to: r.user.id,
    }),
  },

  planTiempo: {
    sesiones: r.many.sesionJuego(),
  },

  pago: {
    sesionJuego: r.one.sesionJuego({
      from: r.pago.sesionJuegoId,
      to: r.sesionJuego.id,
    }),

    usuario: r.one.user({
      from: r.pago.creadoPor,
      to: r.user.id,
    }),
  },

  extensionTiempo: {
    sesionJuego: r.one.sesionJuego({
      from: r.extensionTiempo.sesionJuegoId,
      to: r.sesionJuego.id,
    }),

    usuario: r.one.user({
      from: r.extensionTiempo.creadoPor,
      to: r.user.id,
    }),
  },
}));
