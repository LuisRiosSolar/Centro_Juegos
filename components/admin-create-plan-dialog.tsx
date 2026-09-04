"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPlan } from "@/app/admin/actions";
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
	createPlanDefaults,
	createPlanSchema,
	type CreatePlanValues,
} from "@/lib/session-schemas";

export function AdminCreatePlanDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [result, setResult] = useState<ActionResult | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<CreatePlanValues>({ defaultValues: createPlanDefaults });

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

		const response = await createPlan(parsed.data);
		setResult(response);

		if (!response.ok) {
			toast.error(response.message);
			return;
		}

		toast.success(response.message);
		reset(createPlanDefaults);
		setOpen(false);
		router.refresh();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button size="lg" />}>
				<PlusIcon className="size-4" />
				Nuevo plan
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Crear plan</DialogTitle>
					<DialogDescription>
						Define duración y precio para usarlo al crear sesiones.
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
							<FieldLabel htmlFor="nombre">Nombre (máx. 20 caracteres)</FieldLabel>
							<Input id="nombre" maxLength={20} placeholder="Ej: LITE, FULL, VIP..." {...register("nombre")} />
							<FieldError errors={[errors.nombre]} />
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
							<FieldLabel htmlFor="precio">Precio</FieldLabel>
							<Input
								id="precio"
								type="number"
								min="0"
								step="100"
								{...register("precio")}
							/>
							<FieldError errors={[errors.precio]} />
						</Field>
						<Button className="h-11" type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creando..." : "Crear plan"}
						</Button>
					</FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}
