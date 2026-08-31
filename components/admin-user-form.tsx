"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { createManagedUser, type CreateManagedUserValues } from "@/app/admin/actions";
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

export function AdminUserForm() {
	const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateManagedUserValues>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "user",
		},
	});

	async function onSubmit(values: CreateManagedUserValues) {
		setStatus(null);
		const result = await createManagedUser(values);

		if (!result.ok) {
			setStatus({ type: "error", message: result.message });
			return;
		}

		reset();
		setStatus({ type: "success", message: result.message });
	}

	return (
		<Card className="border-white/70 bg-white/85 shadow-xl shadow-amber-950/5 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
			<CardHeader className="space-y-2">
				<CardTitle className="text-2xl font-semibold tracking-tight">
					Crear usuario
				</CardTitle>
				<CardDescription>
					Solo el superadmin puede crear credenciales para nuevos empleados.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<FieldGroup className="gap-4">
						{status ? (
							<div
								className={
									status.type === "success"
										? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
										: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
								}
							>
								{status.message}
							</div>
						) : null}

						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor="name">Nombre</FieldLabel>
							<Input
								id="name"
								type="text"
								placeholder="Ana Gómez"
								aria-invalid={!!errors.name}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Correo</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="ana@ejemplo.com"
								autoComplete="email"
								aria-invalid={!!errors.email}
								{...register("email")}
							/>
							<FieldError errors={[errors.email]} />
						</Field>

						<Field data-invalid={!!errors.password}>
							<FieldLabel htmlFor="password">Contraseña</FieldLabel>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								aria-invalid={!!errors.password}
								{...register("password")}
							/>
							<FieldError errors={[errors.password]} />
						</Field>

						<Field data-invalid={!!errors.role}>
							<FieldLabel htmlFor="role">Rol</FieldLabel>
							<select
								id="role"
								className="h-11 w-full rounded-xl border border-input bg-white/80 px-3 text-sm text-zinc-900 dark:bg-zinc-900/80 dark:text-zinc-50"
								{...register("role")}
							>
								<option value="user">Usuario</option>
								<option value="admin">Administrador</option>
							</select>
							<FieldError errors={[errors.role]} />
						</Field>

						<FieldDescription className="text-sm text-muted-foreground">
							La contraseña queda protegida y solo está disponible para ese usuario.
						</FieldDescription>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
						>
							{isSubmitting ? "Creando usuario..." : "Crear usuario"}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
