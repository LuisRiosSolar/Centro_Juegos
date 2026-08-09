"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: RegisterFormValues) {
		setFormError(null);

		const parsed = registerSchema.safeParse(values);

		if (!parsed.success) {
			const issue = parsed.error.issues.find((item) => {
				const field = item.path[0];

				return (
					field === "name" ||
					field === "email" ||
					field === "password" ||
					field === "confirmPassword"
				);
			});
			const field = issue?.path[0];

			if (
				issue &&
				(field === "name" ||
					field === "email" ||
					field === "password" ||
					field === "confirmPassword")
			) {
				setError(field, { message: issue.message });
			}

			return;
		}

		const { name, email, password } = parsed.data;
		const { error } = await authClient.signUp.email({
			name,
			email,
			password,
			callbackURL: "/login",
		});

		if (error) {
			setFormError(error.message ?? "No se pudo crear la cuenta");
			return;
		}

		router.push("/login");
		router.refresh();
	}

	return (
		<div className={cn("flex flex-col", className)} {...props}>
			<Card className="overflow-hidden border-white/60 bg-white/85 shadow-2xl shadow-amber-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
				<CardHeader className="items-center gap-4 px-8 pt-8 text-center">
					<div className="relative mx-auto flex justify-center">
						<div className="absolute inset-0 rounded-3xl bg-amber-400/30 blur-xl" />
						<Image
							className="relative mx-auto size-20 rounded-3xl border border-white/80 object-cover shadow-lg shadow-amber-900/20"
							src="/logo.jpg"
							alt="Logo de El Rincón de José"
							width={96}
							height={96}
							priority
						/>
					</div>
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700 dark:text-amber-300">
							Únete hoy
						</p>
						<CardTitle className="text-3xl font-semibold tracking-tight">
							Crea tu cuenta
						</CardTitle>
						<CardDescription className="text-balance text-base">
							Guarda tu progreso y empieza a jugar en El Rincón de José.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="px-8 pb-8">
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<FieldGroup className="gap-4">
							{formError ? (
								<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/30">
									<FieldError>{formError}</FieldError>
								</div>
							) : null}
							<Field data-invalid={!!errors.name}>
								<FieldLabel htmlFor="name">Nombre</FieldLabel>
								<Input
									className="h-11 rounded-xl bg-white/80 dark:bg-zinc-900/80"
									id="name"
									type="text"
									placeholder="José"
									autoComplete="name"
									aria-invalid={!!errors.name}
									{...register("name")}
								/>
								<FieldError errors={[errors.name]} />
							</Field>
							<Field data-invalid={!!errors.email}>
								<FieldLabel htmlFor="email">Correo</FieldLabel>
								<Input
									className="h-11 rounded-xl bg-white/80 dark:bg-zinc-900/80"
									id="email"
									type="email"
									placeholder="jose@example.com"
									autoComplete="email"
									aria-invalid={!!errors.email}
									{...register("email")}
								/>
								<FieldError errors={[errors.email]} />
							</Field>
							<div className="grid gap-4 sm:grid-cols-2">
								<Field data-invalid={!!errors.password}>
									<FieldLabel htmlFor="password">Contraseña</FieldLabel>
									<Input
										className="h-11 rounded-xl bg-white/80 dark:bg-zinc-900/80"
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="new-password"
										aria-invalid={!!errors.password}
										{...register("password")}
									/>
									<FieldError errors={[errors.password]} />
								</Field>
								<Field data-invalid={!!errors.confirmPassword}>
									<FieldLabel htmlFor="confirmPassword">Confirmar</FieldLabel>
									<Input
										className="h-11 rounded-xl bg-white/80 dark:bg-zinc-900/80"
										id="confirmPassword"
										type="password"
										placeholder="••••••••"
										autoComplete="new-password"
										aria-invalid={!!errors.confirmPassword}
										{...register("confirmPassword")}
									/>
									<FieldError errors={[errors.confirmPassword]} />
								</Field>
							</div>
							<Field className="gap-4 pt-2">
								<Button
									className="h-11 w-full rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
								</Button>
								<FieldDescription className="text-center">
									¿Ya tienes cuenta?{" "}
									<Link
										className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300"
										href="/login"
									>
										Inicia sesión
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
