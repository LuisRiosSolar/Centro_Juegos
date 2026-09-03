import { drizzle } from "drizzle-orm/neon-http";

// Keep database initialization out of module evaluation so `next build` can
// run without production secrets. DATABASE_URL is required at request time.
type Database = ReturnType<typeof drizzle>;

let database: Database | undefined;

function getDatabase(): Database {
	if (!database) {
		const url = process.env.DATABASE_URL;
		if (!url) {
			throw new Error("DATABASE_URL is not configured");
		}
		database = drizzle(url);
	}
	return database;
}

export const db = new Proxy({} as Database, {
	get(_target, property) {
		return Reflect.get(getDatabase(), property, getDatabase());
	},
});
