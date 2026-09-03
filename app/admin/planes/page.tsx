import Link from "next/link";
import { ClockIcon, WalletCardsIcon, SparklesIcon, ShieldAlertIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminCreatePlanDialog } from "@/components/admin-create-plan-dialog";
import { AdminEditPlanDialog } from "@/components/admin-edit-plan-dialog";
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
import { getAllPlans } from "@/lib/game-sessions";

export default async function AdminPlansPage() {
	const access = await getAdminAccess();

	if (!access.ok && access.reason === "unauthenticated") redirect("/login");

	if (!access.ok || !access.isRoot) {
		return (
			<main className="flex min-h-svh items-center justify-center px-6">
				<Card className="max-w-md text-center">
					<CardHeader className="items-center">
						<ShieldAlertIcon className="size-10 text-destructive mb-2" />
						<CardTitle>Acceso restringido</CardTitle>
						<CardDescription>
							Solo el super administrador puede crear, editar o eliminar planes de tiempo.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							className="text-sm underline-offset-4 hover:underline"
							href="/admin"
						>
							Volver al inicio
						</Link>
					</CardContent>
				</Card>
			</main>
		);
	}

	const plans = await getAllPlans();

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
					<div className="flex w-full flex-col gap-6 px-4 py-5 lg:px-6">
						<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								<SidebarTrigger />
								<div>
									<div className="flex items-center gap-2">
										<p className="text-sm font-semibold uppercase tracking-wider text-primary">
											Configuración
										</p>
									</div>
									<h1 className="text-3xl font-semibold tracking-tight">
										Tarifas y Planes de Tiempo
									</h1>
									<p className="mt-1 text-sm text-muted-foreground">
										Crea, modifica y ajusta los valores de juego para las sesiones.
									</p>
								</div>
							</div>
							<AdminCreatePlanDialog />
						</header>

						{plans.length === 0 ? (
							<Card className="border-dashed">
								<CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
									<SparklesIcon className="size-8 text-primary/40" />
									<p>No hay planes configurados todavía. Crea el primero para comenzar a registrar turnos.</p>
								</CardContent>
							</Card>
						) : (
							<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
								{plans.map((plan) => (
									<Card
										key={plan.id}
										className={`relative border-border/70 transition-all hover:shadow-md ${
											plan.activo === false ? "opacity-60 bg-muted/30" : "bg-card"
										}`}
									>
										<CardContent className="space-y-4 p-5">
											<div className="flex items-start justify-between gap-2">
												<div>
													<span
														className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
															plan.activo === false
																? "bg-muted text-muted-foreground"
																: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
														}`}
													>
														{plan.activo === false ? "Inactivo" : "Activo"}
													</span>
													<h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">
														{plan.nombre}
													</h3>
												</div>
												<AdminEditPlanDialog plan={plan} />
											</div>

											<div className="grid grid-cols-2 gap-2 text-sm">
												<div className="rounded-xl bg-muted/60 p-3">
													<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<ClockIcon className="size-3.5" /> Duración
													</p>
													<p className="mt-1 font-bold text-foreground">
														{plan.minutos} min
													</p>
												</div>
												<div className="rounded-xl bg-muted/60 p-3">
													<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<WalletCardsIcon className="size-3.5" /> Tarifa
													</p>
													<p className="mt-1 font-bold text-foreground">
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
