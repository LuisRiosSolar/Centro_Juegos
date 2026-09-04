"use client";

import { useState } from "react";
import { Edit2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePlan, togglePlanStatus } from "@/app/admin/actions";
import { type ActionResult } from "@/lib/auth-schemas";
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
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	createPlanSchema,
	type CreatePlanValues,
} from "@/lib/session-schemas";

export type PlanData = {
	id: string;
	nombre: string;
	minutos: number;
	precio: string;
	activo?: boolean;
};

export function AdminEditPlanDialog({ plan }: { plan: PlanData }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [result, setResult] = useState<ActionResult | null>(null);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<CreatePlanValues>({
		defaultValues: {
			nombre: plan.nombre,
			minutos: plan.minutos,
			precio: Number(plan.precio),
		},
	});

	async function onSubmit(values: CreatePlanValues) {
		setResult(null);
		const parsed = createPlanSchema.safeParse(values);

		if (!parsed.success) {
			const issue = parsed.error.issues[0];
			const field = issue?.path[0];

			if (field === "nombre" || field === "minutos" || field === "precio") {
				setError(field, { message: issue.message });
			}

			return;
		}

		const response = await updatePlan(plan.id, parsed.data);
		setResult(response);

		if (!response.ok) {
			toast.error(response.message);
			return;
		}

		toast.success(response.message);
		setOpen(false);
		router.refresh();
	}

	async function handleToggleStatus() {
		const nextStatus = !(plan.activo ?? true);
		const response = await togglePlanStatus(plan.id, nextStatus);

		if (!response.ok) {
			toast.error(response.message);
			return;
		}

		toast.success(response.message);
		setOpen(false);
		router.refresh();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button variant="outline" size="sm" />}>
				<Edit2Icon className="size-3.5" />
				Editar
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar Plan de Tiempo</DialogTitle>
					<DialogDescription>
						Modifica los parámetros de duración y tarifa para este plan.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<FieldGroup>
						{result ? (
							<p role="status" className="text-sm text-muted-foreground">
								{result.message}
							</p>
						) : null}
						<Field data-invalid={!!errors.nombre}>
							<FieldLabel htmlFor={`nombre-${plan.id}`}>Nombre del plan (máx. 20 caracteres)</FieldLabel>
							<Input id={`nombre-${plan.id}`} maxLength={20} {...register("nombre")} />
							<FieldError errors={[errors.nombre]} />
						</Field>
						<Field data-invalid={!!errors.minutos}>
							<FieldLabel htmlFor={`minutos-${plan.id}`}>Duración en minutos</FieldLabel>
							<Input
								id={`minutos-${plan.id}`}
								type="number"
								min="1"
								{...register("minutos")}
							/>
							<FieldError errors={[errors.minutos]} />
						</Field>
						<Field data-invalid={!!errors.precio}>
							<FieldLabel htmlFor={`precio-${plan.id}`}>Precio (COP)</FieldLabel>
							<Input
								id={`precio-${plan.id}`}
								type="number"
								min="0"
								step="100"
								{...register("precio")}
							/>
							<FieldError errors={[errors.precio]} />
						</Field>

						<div className="flex items-center justify-between pt-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className={plan.activo !== false ? "text-destructive hover:bg-destructive/10" : "text-emerald-600 hover:bg-emerald-50"}
								onClick={handleToggleStatus}
							>
								{plan.activo !== false ? "Desactivar plan" : "Activar plan"}
							</Button>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Guardando..." : "Guardar cambios"}
								</Button>
							</div>
						</div>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}
