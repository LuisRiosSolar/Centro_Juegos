DO $$ BEGIN
	CREATE TYPE "estado_sesion" AS ENUM('ACTIVA', 'FINALIZADA', 'CANCELADA');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "metodo_pago" AS ENUM('EFECTIVO', 'TRANSFERENCIA', 'NEQUI', 'DAVIPLATA');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cliente" (
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
CREATE TABLE IF NOT EXISTS "extension_tiempo" (
	"id" text PRIMARY KEY,
	"sesion_juego_id" text NOT NULL,
	"minutos_agregados" integer NOT NULL,
	"valor" numeric NOT NULL,
	"creado_por" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pago" (
	"id" text PRIMARY KEY,
	"sesion_juego_id" text NOT NULL,
	"valor" numeric NOT NULL,
	"metodo_pago" "metodo_pago" NOT NULL,
	"creado_por" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_tiempo" (
	"id" text PRIMARY KEY,
	"nombre" text NOT NULL,
	"minutos" integer NOT NULL,
	"precio" numeric NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "responsable" (
	"id" text PRIMARY KEY,
	"identificacion" text NOT NULL UNIQUE,
	"nombre_completo" text NOT NULL,
	"telefono" text NOT NULL,
	"correo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rol" (
	"id" text PRIMARY KEY,
	"nombre" text NOT NULL UNIQUE,
	"descripcion" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sesion_juego" (
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
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role_id" text;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "cliente" ADD CONSTRAINT "cliente_responsable_id_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "responsable"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "extension_tiempo" ADD CONSTRAINT "extension_tiempo_sesion_juego_id_sesion_juego_id_fkey" FOREIGN KEY ("sesion_juego_id") REFERENCES "sesion_juego"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "extension_tiempo" ADD CONSTRAINT "extension_tiempo_creado_por_user_id_fkey" FOREIGN KEY ("creado_por") REFERENCES "user"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "pago" ADD CONSTRAINT "pago_sesion_juego_id_sesion_juego_id_fkey" FOREIGN KEY ("sesion_juego_id") REFERENCES "sesion_juego"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "pago" ADD CONSTRAINT "pago_creado_por_user_id_fkey" FOREIGN KEY ("creado_por") REFERENCES "user"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "sesion_juego" ADD CONSTRAINT "sesion_juego_cliente_id_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "sesion_juego" ADD CONSTRAINT "sesion_juego_plan_tiempo_id_plan_tiempo_id_fkey" FOREIGN KEY ("plan_tiempo_id") REFERENCES "plan_tiempo"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "sesion_juego" ADD CONSTRAINT "sesion_juego_creado_por_user_id_fkey" FOREIGN KEY ("creado_por") REFERENCES "user"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "user" ADD CONSTRAINT "user_role_id_rol_id_fkey" FOREIGN KEY ("role_id") REFERENCES "rol"("id");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
