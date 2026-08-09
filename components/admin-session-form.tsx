"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import {
	createGameSession,
	type CreateSessionResult,
} from "@/app/admin/actions";
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
import {
	createSessionDefaults,
	createSessionSchema,
	type CreateSessionValues,
} from "@/lib/session-schemas";

const paymentMethods = [
	{ value: "EFECTIVO", label: "Efectivo" },
	{ value: "TRANSFERENCIA", label: "Transferencia" },
	{ value: "NEQUI", label: "Nequi" },
	{ value: "DAVIPLATA", label: "Daviplata" },
] as const;

export function AdminSessionForm() {
	const [result, setResult] = useState<CreateSessionResult | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<CreateSessionValues>({
		defaultValues: createSessionDefaults,
	});

	async function onSubmit(values: CreateSessionValues) {
		setResult(null);
		const parsed = createSessionSchema.safeParse(values);

		if (!parsed.success) {
			const issue = parsed.error.issues[0];
			const field = issue?.path[0];

			if (typeof field === "string" && field in createSessionDefaults) {
				setError(field as keyof CreateSessionValues, {
					message: issue.message,
				});
			}

			return;
		}

		const response = await createGameSession(parsed.data);
		setResult(response);

		if (response.ok) {
			reset({
				...createSessionDefaults,
				planNombre: parsed.data.planNombre,
				minutos: parsed.data.minutos,
				precio: parsed.data.precio,
				metodoPago: parsed.data.metodoPago,
			});
		}
	}

	return (
		<Card className="border-white/70 bg-white/90 shadow-xl shadow-amber-950/10 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80">
			<CardHeader>
				<CardTitle>Nueva sesión de juego</CardTitle>
				<CardDescription>
					Registra responsable, jugador, plan y pago inicial en un solo flujo.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<FieldGroup className="gap-6">
						{result ? (
							<div
								className={
									result.ok
										? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
										: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
								}
							>
								{result.message}
							</div>
						) : null}

						<section className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1 md:col-span-2">
								<h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
									Responsable
								</h2>
								<p className="text-sm text-muted-foreground">
									Datos de la persona a cargo del jugador.
								</p>
							</div>
							<Field data-invalid={!!errors.responsableIdentificacion}>
								<FieldLabel htmlFor="responsableIdentificacion">
									Identificación
								</FieldLabel>
								<Input
									id="responsableIdentificacion"
									{...register("responsableIdentificacion")}
								/>
								<FieldError errors={[errors.responsableIdentificacion]} />
							</Field>
							<Field data-invalid={!!errors.responsableNombre}>
								<FieldLabel htmlFor="responsableNombre">
									Nombre completo
								</FieldLabel>
								<Input
									id="responsableNombre"
									{...register("responsableNombre")}
								/>
								<FieldError errors={[errors.responsableNombre]} />
							</Field>
							<Field data-invalid={!!errors.responsableTelefono}>
								<FieldLabel htmlFor="responsableTelefono">Teléfono</FieldLabel>
								<Input
									id="responsableTelefono"
									{...register("responsableTelefono")}
								/>
								<FieldError errors={[errors.responsableTelefono]} />
							</Field>
							<Field data-invalid={!!errors.responsableCorreo}>
								<FieldLabel htmlFor="responsableCorreo">
									Correo opcional
								</FieldLabel>
								<Input
									id="responsableCorreo"
									type="email"
									{...register("responsableCorreo")}
								/>
								<FieldError errors={[errors.responsableCorreo]} />
							</Field>
						</section>

						<section className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1 md:col-span-2">
								<h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
									Jugador
								</h2>
								<p className="text-sm text-muted-foreground">
									Datos del cliente que usará la estación de juego.
								</p>
							</div>
							<Field data-invalid={!!errors.clienteIdentificacion}>
								<FieldLabel htmlFor="clienteIdentificacion">
									Identificación
								</FieldLabel>
								<Input
									id="clienteIdentificacion"
									{...register("clienteIdentificacion")}
								/>
								<FieldError errors={[errors.clienteIdentificacion]} />
							</Field>
							<Field data-invalid={!!errors.clienteNombre}>
								<FieldLabel htmlFor="clienteNombre">Nombre completo</FieldLabel>
								<Input id="clienteNombre" {...register("clienteNombre")} />
								<FieldError errors={[errors.clienteNombre]} />
							</Field>
							<Field data-invalid={!!errors.clienteFechaNacimiento}>
								<FieldLabel htmlFor="clienteFechaNacimiento">
									Fecha de nacimiento opcional
								</FieldLabel>
								<Input
									id="clienteFechaNacimiento"
									type="date"
									{...register("clienteFechaNacimiento")}
								/>
								<FieldError errors={[errors.clienteFechaNacimiento]} />
							</Field>
							<Field data-invalid={!!errors.clienteObservaciones}>
								<FieldLabel htmlFor="clienteObservaciones">
									Observaciones
								</FieldLabel>
								<Input
									id="clienteObservaciones"
									{...register("clienteObservaciones")}
								/>
								<FieldError errors={[errors.clienteObservaciones]} />
							</Field>
						</section>

						<section className="grid gap-4 md:grid-cols-4">
							<div className="space-y-1 md:col-span-4">
								<h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
									Plan y pago
								</h2>
							</div>
							<Field
								className="md:col-span-2"
								data-invalid={!!errors.planNombre}
							>
								<FieldLabel htmlFor="planNombre">Plan</FieldLabel>
								<Input id="planNombre" {...register("planNombre")} />
								<FieldError errors={[errors.planNombre]} />
							</Field>
							<Field data-invalid={!!errors.minutos}>
								<FieldLabel htmlFor="minutos">Minutos</FieldLabel>
								<Input
									id="minutos"
									type="number"
									min="1"
									{...register("minutos")}
								/>
								<FieldError errors={[errors.minutos]} />
							</Field>
							<Field data-invalid={!!errors.precio}>
								<FieldLabel htmlFor="precio">Valor</FieldLabel>
								<Input
									id="precio"
									type="number"
									min="0"
									step="100"
									{...register("precio")}
								/>
								<FieldError errors={[errors.precio]} />
							</Field>
							<Field
								className="md:col-span-2"
								data-invalid={!!errors.metodoPago}
							>
								<FieldLabel htmlFor="metodoPago">Método de pago</FieldLabel>
								<select
									id="metodoPago"
									className="h-10 rounded-xl border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900/80"
									{...register("metodoPago")}
								>
									{paymentMethods.map((method) => (
										<option key={method.value} value={method.value}>
											{method.label}
										</option>
									))}
								</select>
								<FieldError errors={[errors.metodoPago]} />
							</Field>
							<Field className="justify-end md:col-span-2">
								<Button
									className="h-10 rounded-xl"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Creando sesión..." : "Crear sesión"}
								</Button>
								<FieldDescription>
									La sesión queda activa inmediatamente.
								</FieldDescription>
							</Field>
						</section>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
