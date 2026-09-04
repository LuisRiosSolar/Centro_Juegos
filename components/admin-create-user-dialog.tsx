"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { PlusIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createManagedUser } from "@/app/admin/actions";
import { type CreateManagedUserValues } from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function AdminCreateUserDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		control,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<CreateManagedUserValues>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "admin",
		},
	});

	const selectedRole = useWatch({ control, name: "role" });

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
		toast.success(result.message);
		setOpen(false);
		router.refresh();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button />}>
				<PlusIcon className="size-4 mr-1.5" />
				Crear nuevo usuario
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<UserPlusIcon className="size-5 text-primary" />
						<DialogTitle>Crear nuevo usuario</DialogTitle>
					</div>
					<DialogDescription>
						Ingresa las credenciales y asigna el rol correspondiente para la nueva cuenta.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
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
							<FieldLabel htmlFor="dlg-name">Nombre completo</FieldLabel>
							<Input
								id="dlg-name"
								type="text"
								placeholder="Ej. Carlos Mendoza"
								autoComplete="name"
								aria-invalid={!!errors.name}
								{...register("name")}
							/>
							<FieldError errors={[errors.name]} />
						</Field>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="dlg-email">Correo electrónico</FieldLabel>
							<Input
								id="dlg-email"
								type="email"
								placeholder="carlos@ejemplo.com"
								autoComplete="email"
								aria-invalid={!!errors.email}
								{...register("email")}
							/>
							<FieldError errors={[errors.email]} />
						</Field>

						<Field data-invalid={!!errors.password}>
							<FieldLabel htmlFor="dlg-password">Contraseña</FieldLabel>
							<Input
								id="dlg-password"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								aria-invalid={!!errors.password}
								{...register("password")}
							/>
							<FieldError errors={[errors.password]} />
						</Field>

						<Field data-invalid={!!errors.role}>
							<FieldLabel htmlFor="dlg-role">Rol asignado</FieldLabel>
							<Select
								value={selectedRole}
								onValueChange={(val) => {
									if (val) setValue("role", val as "admin" | "superadmin", { shouldValidate: true });
								}}
							>
								<SelectTrigger
									id="dlg-role"
									className="!h-10 !w-full rounded-xl bg-card border-border/80 px-3 flex items-center justify-between text-sm shadow-2xs hover:border-primary/50 transition-all"
								>
									<SelectValue>
										{(val) =>
											val === "superadmin"
												? "Super Administrador"
												: "Administrador"
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="rounded-xl">
									<SelectItem value="admin" className="rounded-lg text-sm">
										Administrador
									</SelectItem>
									<SelectItem value="superadmin" className="rounded-lg text-sm">
										Super Administrador
									</SelectItem>
								</SelectContent>
							</Select>
							<FieldError errors={[errors.role]} />
						</Field>

						<FieldDescription className="text-xs text-muted-foreground">
							Los administradores pueden gestionar turnos y tiempos sin acceso a configuración de planes ni finanzas globales.
						</FieldDescription>

						<div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								className="h-10 rounded-xl px-5 text-xs font-semibold border-border/80 hover:bg-muted/60"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="h-10 rounded-xl px-6 text-xs font-bold shadow-sm"
							>
								{isSubmitting ? "Creando..." : "Crear usuario"}
							</Button>
						</div>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}
