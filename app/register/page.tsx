import { RegisterForm } from "@/components/register-form";

export default function Page() {
	return (
		<main className="relative flex min-h-svh overflow-hidden bg-background text-foreground">
			<section className="relative mx-auto flex w-full max-w-lg items-center px-6 py-10">
				<RegisterForm className="w-full" />
			</section>
		</main>
	);
}
