import { LoginForm } from "@/components/login-form";

export default function Page() {
	return (
		<main className="relative flex min-h-svh overflow-hidden bg-[#fff8ed] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.38),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.16),transparent_30%)]" />
			<div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl" />

			<section className="relative mx-auto flex w-full max-w-md items-center px-6 py-10">
				<LoginForm className="w-full" />
			</section>
		</main>
	);
}
