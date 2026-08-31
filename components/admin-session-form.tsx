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
		<section className="overflow-hidden rounded-[2rem] border border-[#f0ddc4] bg-[#f6e7cf] p-4 shadow-[0_20px_45px_rgba(137,89,35,0.12)] sm:p-5">
			<div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-[#a56ae6] via-[#bb63d8] to-[#f1a4d2] text-xl shadow-lg shadow-violet-500/25">
						🎮
					</div>
					<div>
						<h3 className="text-2xl font-black tracking-tight text-[#1d1d2f]">
							Kids Arcade
						</h3>
						<p className="text-sm text-[#60617d]">
							Control de tiempo de juego
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3 self-start md:self-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-[#4ec7d4] px-4 py-2 text-sm font-bold text-white shadow-md shadow-cyan-500/20">
						<span className="inline-flex size-2.5 rounded-full bg-white" />
						0 JUGANDO
					</div>
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#7b56f7] to-[#d96ad4] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105"
					>
						+ Nuevo ingreso
					</button>
				</div>
			</div>

			<div className="rounded-[1.75rem] border border-white/60 bg-[#f6d8ea] p-4 sm:p-5">
				<div className="mb-5 flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-full bg-[#ffa0a0] text-xl shadow-inner shadow-white/70">
						⏰
					</div>
					<h2 className="text-2xl font-black tracking-tight text-[#1f1f31]">
						¡Tiempo terminado!
					</h2>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
					{result ? (
						<div
							className={
								result.ok
									? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
									: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
							}
						>
							{result.message}
						</div>
					) : null}

					<div className="grid gap-4 md:grid-cols-2">
						<Field data-invalid={!!errors.clienteNombre} className="md:col-span-2">
							<FieldLabel htmlFor="clienteNombre" className="text-[#2d2d3b]">
								Nombre del jugador
							</FieldLabel>
							<Input
								id="clienteNombre"
								placeholder="Ej: pepito"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("clienteNombre")}
							/>
							<FieldError errors={[errors.clienteNombre]} />
						</Field>

						<Field data-invalid={!!errors.clienteIdentificacion}>
							<FieldLabel htmlFor="clienteIdentificacion" className="text-[#2d2d3b]">
								Identificación
							</FieldLabel>
							<Input
								id="clienteIdentificacion"
								placeholder="Ej: 1002345678"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("clienteIdentificacion")}
							/>
							<FieldError errors={[errors.clienteIdentificacion]} />
						</Field>

						<Field data-invalid={!!errors.clienteFechaNacimiento}>
							<FieldLabel htmlFor="clienteFechaNacimiento" className="text-[#2d2d3b]">
								Edad / fecha
							</FieldLabel>
							<Input
								id="clienteFechaNacimiento"
								type="date"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("clienteFechaNacimiento")}
							/>
							<FieldError errors={[errors.clienteFechaNacimiento]} />
						</Field>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<Field data-invalid={!!errors.planNombre} className="md:col-span-2">
							<FieldLabel htmlFor="planNombre" className="text-[#2d2d3b]">
								Plan
							</FieldLabel>
							<Input
								id="planNombre"
								placeholder="Hora de juego"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("planNombre")}
							/>
							<FieldError errors={[errors.planNombre]} />
						</Field>

						<Field data-invalid={!!errors.minutos}>
							<FieldLabel htmlFor="minutos" className="text-[#2d2d3b]">
								Tiempo
							</FieldLabel>
							<Input
								id="minutos"
								type="number"
								min="1"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("minutos")}
							/>
							<FieldError errors={[errors.minutos]} />
						</Field>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Field data-invalid={!!errors.responsableNombre}>
							<FieldLabel htmlFor="responsableNombre" className="text-[#2d2d3b]">
								Responsable
							</FieldLabel>
							<Input
								id="responsableNombre"
								placeholder="Nombre del acudiente"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("responsableNombre")}
							/>
							<FieldError errors={[errors.responsableNombre]} />
						</Field>

						<Field data-invalid={!!errors.responsableTelefono}>
							<FieldLabel htmlFor="responsableTelefono" className="text-[#2d2d3b]">
								Teléfono
							</FieldLabel>
							<Input
								id="responsableTelefono"
								placeholder="Ej: 3200000000"
								className="h-12 rounded-2xl border-0 bg-white/80 text-base shadow-inner shadow-zinc-200/80 focus-visible:ring-2 focus-visible:ring-violet-500"
								{...register("responsableTelefono")}
							/>
							<FieldError errors={[errors.responsableTelefono]} />
						</Field>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							className="h-12 rounded-full border-white/80 bg-white/60 px-5 text-sm font-semibold text-[#2d2d3b] hover:bg-white/80"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-12 rounded-full bg-gradient-to-r from-[#4cc7d5] via-[#4eb8de] to-[#7a57f6] px-6 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-105"
						>
							{isSubmitting ? "Guardando..." : "Guardar ingreso"}
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
}
