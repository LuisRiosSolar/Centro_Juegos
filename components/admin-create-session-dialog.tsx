"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import {
	AdminSessionForm,
	type SessionPlanOption,
} from "@/components/admin-session-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export function AdminCreateSessionDialog({
	plans,
}: {
	plans: SessionPlanOption[];
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button size="lg" />}>
				<PlusIcon className="size-4" />
				Nueva sesión
			</DialogTrigger>
			<DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto p-0 sm:max-w-3xl">
				<DialogHeader className="border-b px-5 pt-5 pb-4">
					<DialogTitle className="text-xl">Nueva sesión</DialogTitle>
					<DialogDescription>
						Crea una sesión en tres pasos: plan, jugador y responsable.
					</DialogDescription>
				</DialogHeader>
				<div className="px-5 pb-5">
					<AdminSessionForm
						plans={plans}
						onCreatedAction={() => setOpen(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
