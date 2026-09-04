"use client";

import { useState } from "react";
import { CalendarIcon, CheckCircle2Icon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createGameSession } from "@/app/admin/actions";
import { type ActionResult } from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	createSessionDefaults,
	createSessionSchema,
	type CreateSessionValues,
} from "@/lib/session-schemas";
import { cn } from "@/lib/utils";

export type SessionPlanOption = {
	id: string;
	nombre: string;
	minutos: number;
	precio: string;
};

const paymentMethods = [
	{ value: "EFECTIVO", label: "Efectivo" },
	{ value: "TRANSFERENCIA", label: "Transferencia" },
	{ value: "NEQUI", label: "Nequi" },
	{ value: "DAVIPLATA", label: "Daviplata" },
] as const;

type AdminSessionFormProps = {
	plans: SessionPlanOption[];
	onCreatedAction?: () => void;
};

export function AdminSessionForm({
	plans,
	onCreatedAction,
}: AdminSessionFormProps) {
	const [result, setResult] = useState<ActionResult | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		setValue,
		control,
		formState: { errors, isSubmitting },
	} = useForm<CreateSessionValues>({
		defaultValues: {
			...createSessionDefaults,
			planTiempoId: plans[0]?.id ?? "",
		},
	});
	const selectedPlanId = useWatch({ control, name: "planTiempoId" });
	const selectedPaymentMethod = useWatch({ control, name: "metodoPago" });
	const selectedBirthDate = useWatch({
		control,
		name: "clienteFechaNacimiento",
	});
	const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

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

		if (!response.ok) {
			toast.error(response.message);
			return;
		}

		toast.success(response.message);
		reset({
			...createSessionDefaults,
			planTiempoId: plans[0]?.id ?? "",
			metodoPago: parsed.data.metodoPago,
		});
		onCreatedAction?.();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
			{result && !result.ok ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					{result.message}
				</div>
			) : null}

			{plans.length === 0 ? (
				<div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
					Crea al menos un plan de tiempo antes de abrir una sesión.
				</div>
			) : null}

			<FieldGroup className="gap-5">
				<SectionCard
					step="1"
					title="Plan y pago"
					description="Define cuánto tiempo jugará y cómo pagó."
				>
					<div className="grid gap-4 md:grid-cols-[1fr_14rem]">
						<Field data-invalid={!!errors.planTiempoId}>
							<RequiredLabel htmlFor="planTiempoId">
								Plan de tiempo
							</RequiredLabel>
							<Select
								value={selectedPlanId || null}
								onValueChange={(value) =>
									setValue("planTiempoId", value ?? "", {
										shouldValidate: true,
									})
								}
							>
								<SelectTrigger
									id="planTiempoId"
									className="h-11 w-full"
									aria-invalid={!!errors.planTiempoId}
								>
									<SelectValue placeholder="Selecciona un plan">
										{(value) =>
											plans.find((plan) => plan.id === value)?.nombre ??
											"Selecciona un plan"
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{plans.map((plan) => (
										<SelectItem key={plan.id} value={plan.id}>
											{plan.nombre} · {plan.minutos} min · ${" "}
											{Number(plan.precio).toLocaleString("es-CO")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError errors={[errors.planTiempoId]} />
						</Field>

						<Field data-invalid={!!errors.metodoPago}>
							<RequiredLabel htmlFor="metodoPago">Método de pago</RequiredLabel>
							<Select
								value={selectedPaymentMethod}
								onValueChange={(value) => {
									if (!value) return;

									setValue(
										"metodoPago",
										value as CreateSessionValues["metodoPago"],
										{ shouldValidate: true },
									);
								}}
							>
								<SelectTrigger
									id="metodoPago"
									className="h-11 w-full"
									aria-invalid={!!errors.metodoPago}
								>
									<SelectValue placeholder="Selecciona un método">
										{(value) =>
											paymentMethods.find((method) => method.value === value)
												?.label ?? "Selecciona un método"
										}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{paymentMethods.map((method) => (
										<SelectItem key={method.value} value={method.value}>
											{method.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError errors={[errors.metodoPago]} />
						</Field>
					</div>

					{selectedPlan ? (
						<div className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm sm:grid-cols-3">
							<SummaryItem label="Plan" value={selectedPlan.nombre} />
							<SummaryItem
								label="Duración"
								value={`${selectedPlan.minutos} min`}
							/>
							<SummaryItem
								label="Valor"
								value={`$${Number(selectedPlan.precio).toLocaleString("es-CO")}`}
							/>
						</div>
					) : null}
				</SectionCard>

				<SectionCard
					step="2"
					title="Jugador"
					description="Datos de la persona que usará la consola."
				>
					<div className="grid gap-4 md:grid-cols-2">
						<Field data-invalid={!!errors.clienteIdentificacion}>
							<RequiredLabel htmlFor="clienteIdentificacion">
								Identificación
							</RequiredLabel>
							<Input
								id="clienteIdentificacion"
								placeholder="Ej. 1020304050"
								inputMode="numeric"
								autoComplete="off"
								{...register("clienteIdentificacion", {
									onChange: (e) => {
										e.target.value = e.target.value.replace(/\D/g, "");
									},
								})}
							/>
							<FieldError errors={[errors.clienteIdentificacion]} />
						</Field>

						<Field data-invalid={!!errors.clienteNombre}>
							<RequiredLabel htmlFor="clienteNombre">
								Nombre completo
							</RequiredLabel>
							<Input
								id="clienteNombre"
								placeholder="Nombre del jugador"
								autoComplete="name"
								{...register("clienteNombre", {
									onChange: (e) => {
										e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
									},
								})}
							/>
							<FieldError errors={[errors.clienteNombre]} />
						</Field>

						<Field data-invalid={!!errors.clienteFechaNacimiento}>
							<FieldLabel htmlFor="clienteFechaNacimiento">
								Fecha de nacimiento
							</FieldLabel>
							<DatePickerSimple
								id="clienteFechaNacimiento"
								date={parseDateValue(selectedBirthDate)}
								onDateChange={(date) => {
									setValue("clienteFechaNacimiento", formatDateValue(date), {
										shouldValidate: true,
									});
								}}
							/>
							<FieldError errors={[errors.clienteFechaNacimiento]} />
						</Field>

						<Field data-invalid={!!errors.clienteObservaciones}>
							<FieldLabel htmlFor="clienteObservaciones">
								Observaciones
							</FieldLabel>
							<Input
								id="clienteObservaciones"
								placeholder="Alergias, notas, preferencias..."
								{...register("clienteObservaciones")}
							/>
							<FieldError errors={[errors.clienteObservaciones]} />
						</Field>
					</div>
				</SectionCard>

				<SectionCard
					step="3"
					title="Responsable"
					description="Contacto de la persona a cargo del jugador."
				>
					<div className="grid gap-4 md:grid-cols-2">
						<Field data-invalid={!!errors.responsableIdentificacion}>
							<RequiredLabel htmlFor="responsableIdentificacion">
								Identificación
							</RequiredLabel>
							<Input
								id="responsableIdentificacion"
								placeholder="Documento del responsable"
								inputMode="numeric"
								autoComplete="off"
								{...register("responsableIdentificacion", {
									onChange: (e) => {
										e.target.value = e.target.value.replace(/\D/g, "");
									},
								})}
							/>
							<FieldError errors={[errors.responsableIdentificacion]} />
						</Field>

						<Field data-invalid={!!errors.responsableNombre}>
							<RequiredLabel htmlFor="responsableNombre">
								Nombre completo
							</RequiredLabel>
							<Input
								id="responsableNombre"
								placeholder="Nombre del responsable"
								autoComplete="name"
								{...register("responsableNombre", {
									onChange: (e) => {
										e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
									},
								})}
							/>
							<FieldError errors={[errors.responsableNombre]} />
						</Field>

						<Field data-invalid={!!errors.responsableTelefono}>
							<RequiredLabel htmlFor="responsableTelefono">
								Teléfono
							</RequiredLabel>
							<Input
								id="responsableTelefono"
								placeholder="Número de contacto"
								type="tel"
								inputMode="numeric"
								autoComplete="tel"
								{...register("responsableTelefono", {
									onChange: (e) => {
										e.target.value = e.target.value.replace(/\D/g, "");
									},
								})}
							/>
							<FieldError errors={[errors.responsableTelefono]} />
						</Field>

						<Field data-invalid={!!errors.responsableCorreo}>
							<FieldLabel htmlFor="responsableCorreo">Correo</FieldLabel>
							<Input
								id="responsableCorreo"
								placeholder="correo@ejemplo.com"
								type="email"
								autoComplete="email"
								{...register("responsableCorreo")}
							/>
							<FieldError errors={[errors.responsableCorreo]} />
						</Field>
					</div>
				</SectionCard>
			</FieldGroup>

			<div className="sticky bottom-0 -mx-1 border-t bg-popover/95 px-1 pt-4 pb-1 backdrop-blur supports-[backdrop-filter]:bg-popover/80">
				<Button
					className="h-11 w-full"
					type="submit"
					disabled={isSubmitting || plans.length === 0}
				>
					{isSubmitting ? (
						"Creando sesión..."
					) : (
						<span className="inline-flex items-center gap-2">
							<CheckCircle2Icon className="size-4" />
							Crear sesión
						</span>
					)}
				</Button>
			</div>
		</form>
	);
}

function RequiredLabel({
	children,
	...props
}: React.ComponentProps<typeof FieldLabel>) {
	return (
		<FieldLabel {...props}>
			{children}
			<span className="text-destructive" aria-hidden="true">
				*
			</span>
		</FieldLabel>
	);
}

function DatePickerSimple({
	id,
	date,
	onDateChange,
}: {
	id: string;
	date: Date | undefined;
	onDateChange: (date: Date | undefined) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="outline"
						id={id}
						type="button"
						className={cn(
							"h-11 w-full justify-start gap-2 font-normal",
							!date && "text-muted-foreground",
						)}
					/>
				}
			>
				<CalendarIcon className="size-4" />
				{date ? date.toLocaleDateString("es-CO") : "Selecciona una fecha"}
			</PopoverTrigger>
			<PopoverContent className="w-auto overflow-hidden p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					defaultMonth={date}
					captionLayout="dropdown"
					disabled={{ after: new Date() }}
					onSelect={(selectedDate) => {
						onDateChange(selectedDate);
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}

function SectionCard({
	step,
	title,
	description,
	children,
}: {
	step: string;
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="border-border/70 bg-card/70">
			<CardContent className="space-y-4 p-4">
				<div className="flex gap-3">
					<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
						{step}
					</span>
					<div>
						<h2 className="font-semibold leading-none">{title}</h2>
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					</div>
				</div>
				{children}
			</CardContent>
		</Card>
	);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="font-semibold">{value}</p>
		</div>
	);
}

function parseDateValue(value: string) {
	if (!value) return undefined;

	const date = new Date(`${value}T00:00:00`);

	return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date: Date | undefined) {
	if (!date) return "";

	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");

	return `${year}-${month}-${day}`;
}
