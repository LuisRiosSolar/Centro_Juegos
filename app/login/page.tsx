import { LoginForm } from "@/components/login-form";

export default function Page() {
	return (
		<main className="relative flex min-h-svh overflow-hidden ">
			<section className="relative mx-auto flex w-full max-w-md items-center px-6 py-10">
				<LoginForm className="w-full" />
			</section>
		</main>
	);
}
