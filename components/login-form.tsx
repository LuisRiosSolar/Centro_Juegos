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
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

export function LoginForm({
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
	} = useForm<LoginFormValues>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: LoginFormValues) {
		setFormError(null);

		const parsed = loginSchema.safeParse(values);

		if (!parsed.success) {
			const issue = parsed.error.issues.find((item) => {
				const field = item.path[0];

				return field === "email" || field === "password";
			});
			const field = issue?.path[0];

			if (issue && (field === "email" || field === "password")) {
				setError(field, { message: issue.message });
			}

			return;
		}

		const { error } = await authClient.signIn.email({
			email: parsed.data.email,
			password: parsed.data.password,
			callbackURL: "/sesiones",
		});

		if (error) {
			setFormError(error.message ?? "No se pudo iniciar sesión");
			return;
		}

		router.push("/sesiones");
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
							Bienvenido
						</p>
						<CardTitle className="text-3xl font-semibold tracking-tight">
							Entrar a El Rincón de José
						</CardTitle>
						<CardDescription className="text-balance text-base">
							Continúa a tu cuenta para descubrir juegos, partidas y nuevos
							retos.
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
							<Field data-invalid={!!errors.password}>
								<FieldLabel htmlFor="password">Contraseña</FieldLabel>
								<Input
									className="h-11 rounded-xl bg-white/80 dark:bg-zinc-900/80"
									id="password"
									type="password"
									placeholder="••••••••"
									autoComplete="current-password"
									aria-invalid={!!errors.password}
									{...register("password")}
								/>
								<FieldError errors={[errors.password]} />
							</Field>
							<Field className="gap-4 pt-2">
								<Button
									className="h-11 w-full rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Entrando..." : "Entrar"}
								</Button>
								<FieldDescription className="text-center">
									¿No tienes una cuenta?{" "}
									<Link
										className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300"
										href="/register"
									>
										Regístrate
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
