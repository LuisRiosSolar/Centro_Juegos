import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<main className="relative flex min-h-svh overflow-hidden bg-[#fff8ed] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.14),transparent_30%)]" />
			<section className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
				<Image
					className="size-28 rounded-[2rem] object-cover shadow-2xl shadow-amber-950/20"
					src="/logo.jpg"
					alt="Logo de El Rincón de José"
					width={160}
					height={160}
					priority
				/>
				<div className="space-y-4">
					<p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700 dark:text-amber-300">
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
						className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-medium text-white shadow-lg shadow-zinc-950/15 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
						href="/sesiones"
					>
						Ir a sesiones
					</Link>
					<Link
						className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white/70 px-6 text-sm font-medium hover:bg-white dark:border-white/10 dark:bg-zinc-900/70 dark:hover:bg-zinc-900"
						href="/login"
					>
						Iniciar sesión
					</Link>
				</div>
			</section>
		</main>
	);
}
