"use client";

import Image from "next/image";
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
			<Card className="overflow-hidden border-border bg-card/85 shadow-2xl backdrop-blur-xl">
				<CardHeader className="items-center gap-4 px-8 pt-8 text-center">
					<div className="relative mx-auto flex justify-center">
						<div className="absolute inset-0 rounded-3xl bg-primary/30 blur-xl" />
						<Image
							className="relative mx-auto size-20 rounded-3xl border border-border object-cover shadow-lg"
							src="/logo.jpg"
							alt="Logo de El Rincón de José"
							width={96}
							height={96}
							priority
						/>
					</div>
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700 dark:text-amber-300">
							Acceso administrativo
						</p>
						<CardTitle className="text-3xl font-semibold tracking-tight">
							El Rincón de José
						</CardTitle>
						<CardDescription className="text-balance text-base">
							Gestiona registros, tiempos y pagos del centro de juegos.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="px-8 pb-8">
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<FieldGroup className="gap-4">
							{formError ? (
								<div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
									<FieldError>{formError}</FieldError>
								</div>
							) : null}
							<Field data-invalid={!!errors.email}>
								<FieldLabel htmlFor="email">Correo Electronico</FieldLabel>
								<Input
									className="h-11 rounded-xl bg-background/80"
									id="email"
									type="email"
									placeholder="pepitoperez@example.com"
									autoComplete="email"
									aria-invalid={!!errors.email}
									{...register("email")}
								/>
								<FieldError errors={[errors.email]} />
							</Field>
							<Field data-invalid={!!errors.password}>
								<FieldLabel htmlFor="password">Contraseña</FieldLabel>
								<Input
									className="h-11 rounded-xl bg-background/80"
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
									className="h-11 w-full rounded-xl shadow-lg"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Entrando..." : "Entrar"}
								</Button>
								<FieldDescription className="text-center text-sm text-muted-foreground">
									🔒 Acceso exclusivo para personal autorizado.
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
