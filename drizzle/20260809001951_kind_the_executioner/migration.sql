CREATE TYPE "estado_sesion" AS ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "metodo_pago" AS ENUM('EFECTIVO', 'TRANSFERENCIA', 'NEQUI', 'DAVIPLATA');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cliente" (
	"id" text PRIMARY KEY,
	"identificacion" text NOT NULL UNIQUE,
	"nombre_completo" text NOT NULL,
	"fecha_nacimiento" timestamp,
	"responsable_id" text NOT NULL,
	"observaciones" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extension_tiempo" (
	"id" text PRIMARY KEY,
	"sesion_juego_id" text NOT NULL,
	"minutos_agregados" integer NOT NULL,
	"valor" numeric NOT NULL,
	"creado_por" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pago" (
	"id" text PRIMARY KEY,
	"sesion_juego_id" text NOT NULL,
	"valor" numeric NOT NULL,
	"metodo_pago" "metodo_pago" NOT NULL,
	"creado_por" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_tiempo" (
	"id" text PRIMARY KEY,
	"nombre" text NOT NULL,
	"minutos" integer NOT NULL,
	"precio" numeric NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responsable" (
	"id" text PRIMARY KEY,
	"identificacion" text NOT NULL UNIQUE,
	"nombre_completo" text NOT NULL,
	"telefono" text NOT NULL,
	"correo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rol" (
	"id" text PRIMARY KEY,
	"nombre" text NOT NULL UNIQUE,
	"descripcion" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesion_juego" (
	"id" text PRIMARY KEY,
	"cliente_id" text NOT NULL,
	"plan_tiempo_id" text NOT NULL,
	"fecha_ingreso" timestamp DEFAULT now() NOT NULL,
	"fecha_salida" timestamp,
	"minutos_totales" integer NOT NULL,
	"estado" "estado_sesion" DEFAULT 'ACTIVA'::"estado_sesion" NOT NULL,
	"creado_por" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role_id" text
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_responsable_id_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "responsable"("id");--> statement-breakpoint
ALTER TABLE "extension_tiempo" ADD CONSTRAINT "extension_tiempo_sesion_juego_id_sesion_juego_id_fkey" FOREIGN KEY ("sesion_juego_id") REFERENCES "sesion_juego"("id");--> statement-breakpoint
ALTER TABLE "extension_tiempo" ADD CONSTRAINT "extension_tiempo_creado_por_user_id_fkey" FOREIGN KEY ("creado_por") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "pago" ADD CONSTRAINT "pago_sesion_juego_id_sesion_juego_id_fkey" FOREIGN KEY ("sesion_juego_id") REFERENCES "sesion_juego"("id");--> statement-breakpoint
ALTER TABLE "pago" ADD CONSTRAINT "pago_creado_por_user_id_fkey" FOREIGN KEY ("creado_por") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "sesion_juego" ADD CONSTRAINT "sesion_juego_cliente_id_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id");--> statement-breakpoint
ALTER TABLE "sesion_juego" ADD CONSTRAINT "sesion_juego_plan_tiempo_id_plan_tiempo_id_fkey" FOREIGN KEY ("plan_tiempo_id") REFERENCES "plan_tiempo"("id");--> statement-breakpoint
ALTER TABLE "sesion_juego" ADD CONSTRAINT "sesion_juego_creado_por_user_id_fkey" FOREIGN KEY ("creado_por") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_rol_id_fkey" FOREIGN KEY ("role_id") REFERENCES "rol"("id");