import Link from "next/link";
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
			<AdminSidebar userName={access.name} active="planes" />
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
								</div>
							</div>
							<AdminCreatePlanDialog />
						</header>

						{plans.length === 0 ? (
							<Card>
								<CardContent className="flex min-h-52 items-center justify-center text-center text-muted-foreground">
									No hay planes activos todavía.
								</CardContent>
							</Card>
						) : (
							<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
								{plans.map((plan) => (
									<Card key={plan.id}>
										<CardContent className="p-4">
											<p className="font-semibold">{plan.nombre}</p>
											<p className="mt-1 text-sm text-muted-foreground">
												{plan.minutos} min · $
												{Number(plan.precio).toLocaleString("es-CO")}
											</p>
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
