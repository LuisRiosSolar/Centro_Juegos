import { drizzle } from "drizzle-orm/neon-http";

// Dokploy injects DATABASE_URL when the container starts. Next also evaluates
// this module at image-build time, where runtime variables do not exist yet.
// The fallback is inert because no database query runs while building.
export const db = drizzle(
	process.env.DATABASE_URL ?? "postgresql://build:build@localhost:5432/build",
);
