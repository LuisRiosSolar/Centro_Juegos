import Link from "next/link";
import { ClockIcon, WalletCardsIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminCreatePlanDialog } from "@/components/admin-create-plan-dialog";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAdminAccess } from "@/lib/admin-auth";
import { getActivePlans } from "@/lib/game-sessions";

export default async function AdminPlansPage() {
	const access = await getAdminAccess();

	if (!access.ok && access.reason === "unauthenticated") redirect("/login");

	if (!access.ok) {
		return (
			<main className="flex min-h-svh items-center justify-center px-6">
				<Card className="max-w-md text-center">
					<CardHeader>
						<CardTitle>Acceso restringido</CardTitle>
						<CardDescription>
							Tu usuario no tiene rol administrador.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							className="text-sm underline-offset-4 hover:underline"
							href="/"
						>
							Volver al inicio
						</Link>
					</CardContent>
				</Card>
			</main>
		);
	}

	const plans = await getActivePlans();

	return (
		<SidebarProvider>
			<AdminSidebar
				userName={access.name}
				userEmail={access.email}
				isRoot={access.isRoot}
				active="planes"
			/>
			<SidebarInset>
				<main className="min-h-svh">
					<div className="flex w-full flex-col gap-5 px-4 py-5 lg:px-6">
						<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								<SidebarTrigger />
								<div>
									<p className="text-sm text-muted-foreground">
										Administración
									</p>
									<h1 className="text-3xl font-semibold tracking-tight">
										Planes de tiempo
									</h1>
									<p className="mt-1 text-sm text-muted-foreground">
										{plans.length}{" "}
										{plans.length === 1
											? "plan disponible"
											: "planes disponibles"}
									</p>
								</div>
							</div>
							<AdminCreatePlanDialog />
						</header>

						{plans.length === 0 ? (
							<Card className="border-dashed">
								<CardContent className="flex min-h-52 items-center justify-center text-center text-muted-foreground">
									No hay planes activos todavía. Crea el primero para abrir
									sesiones.
								</CardContent>
							</Card>
						) : (
							<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
								{plans.map((plan) => (
									<Card
										key={plan.id}
										className="border-border/70 transition-shadow hover:shadow-md"
									>
										<CardContent className="space-y-4 p-4">
											<p className="truncate font-semibold">{plan.nombre}</p>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div className="rounded-lg bg-muted/70 p-2.5">
													<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<ClockIcon className="size-3.5" /> Duración
													</p>
													<p className="mt-1 font-semibold">
														{plan.minutos} min
													</p>
												</div>
												<div className="rounded-lg bg-muted/70 p-2.5">
													<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<WalletCardsIcon className="size-3.5" /> Precio
													</p>
													<p className="mt-1 font-semibold">
														${Number(plan.precio).toLocaleString("es-CO")}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</section>
						)}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
