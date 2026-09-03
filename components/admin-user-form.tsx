"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createManagedUser } from "@/app/admin/actions";
import { type CreateManagedUserValues } from "@/lib/auth-schemas";
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
	const router = useRouter();
	const [status, setStatus] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

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
			role: "admin",
		},
	});

	async function onSubmit(values: CreateManagedUserValues) {
		setStatus(null);
		const result = await createManagedUser(values);

		if (!result.ok) {
			setStatus({ type: "error", message: result.message });
			toast.error(result.message);
			return;
		}

		reset({
			name: "",
			email: "",
			password: "",
			role: "admin",
		});
		setStatus({ type: "success", message: result.message });
		toast.success(result.message);
		router.refresh();
	}

	return (
		<Card className="border-border/70 shadow-sm">
			<CardHeader className="space-y-1">
				<div className="flex items-center gap-2">
					<UserPlusIcon className="size-5 text-primary" />
					<CardTitle className="text-xl font-semibold tracking-tight">
						Crear nuevo usuario
					</CardTitle>
				</div>
				<CardDescription>
					Solo el super administrador puede crear credenciales de acceso para nuevos
					administradores del sistema.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<FieldGroup className="gap-4">
						{status ? (
							<div
								className={
									status.type === "success"
										? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
										: "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
								}
							>
								{status.message}
							</div>
						) : null}

						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor="name">Nombre completo</FieldLabel>
							<Input
								id="name"
								type="text"
								placeholder="Ej. Carlos Mendoza"
								autoComplete="name"
								aria-invalid={!!errors.name}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="carlos@ejemplo.com"
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
							<FieldLabel htmlFor="role">Rol asignado</FieldLabel>
							<select
								id="role"
								className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								{...register("role")}
							>
								<option value="admin">Administrador (Acceso limitado)</option>
								<option value="superadmin">Super Administrador (Acceso total)</option>
							</select>
							<FieldError errors={[errors.role]} />
						</Field>

						<FieldDescription className="text-xs text-muted-foreground">
							Los administradores pueden gestionar turnos y tiempos sin acceso a configuración de planes ni finanzas globales.
						</FieldDescription>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 w-full"
						>
							{isSubmitting ? "Creando usuario..." : "Crear usuario"}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
