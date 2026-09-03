import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserAccess } from "@/lib/auth-access";

export default async function Home() {
	const access = await getCurrentUserAccess();

	if (access.ok) {
		redirect(access.isRoot || access.isAdmin ? "/admin" : "/sesiones");
	}

	return (
		<main className="relative flex min-h-svh overflow-hidden bg-background text-foreground">
			<section className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
				<Image
					className="size-28 rounded-[2rem] object-cover shadow-2xl"
					src="/logo.jpg"
					alt="Logo de El Rincón de José"
					width={160}
					height={160}
					priority
				/>
				<div className="space-y-4">
					<p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
						Centro de juegos
					</p>
					<h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
						El Rincón de José
					</h1>
					<p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
						Administra sesiones activas, jugadores, responsables y pagos desde
						un panel simple.
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Link
						className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
						href="/sesiones"
					>
						Ir a sesiones
					</Link>
					<Link
						className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card/70 px-6 text-sm font-medium hover:bg-card"
						href="/login"
					>
						Iniciar sesión
					</Link>
				</div>
			</section>
		</main>
	);
}
