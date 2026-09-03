import Link from "next/link";
import { redirect } from "next/navigation";
import { UsersIcon, ShieldAlertIcon } from "lucide-react";

import { AdminUserForm } from "@/components/admin-user-form";
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
import { db } from "@/db";
import { user, rol } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminUsersPage() {
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
							Solo el super administrador puede gestionar usuarios del sistema.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							className="text-sm underline-offset-4 hover:underline"
							href="/admin"
						>
							Volver al panel principal
						</Link>
					</CardContent>
				</Card>
			</main>
		);
	}

	const existingUsers = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
			roleName: rol.nombre,
		})
		.from(user)
		.leftJoin(rol, eq(user.roleId, rol.id));

	return (
		<SidebarProvider>
			<AdminSidebar
				userName={access.name}
				userEmail={access.email}
				isRoot={access.isRoot}
				active="usuarios"
			/>
			<SidebarInset>
				<main className="min-h-svh">
					<div className="flex w-full flex-col gap-6 px-4 py-5 lg:px-6">
						<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								<SidebarTrigger />
								<div>
									<p className="text-sm text-muted-foreground">Administración</p>
									<h1 className="text-3xl font-semibold tracking-tight">
										Gestión de usuarios
									</h1>
									<p className="mt-1 text-sm text-muted-foreground">
										Crea y administra las cuentas autorizadas para operar el centro.
									</p>
								</div>
							</div>
						</header>

						<div className="grid gap-6 lg:grid-cols-[440px_minmax(0,1fr)]">
							<div>
								<AdminUserForm />
							</div>

							<section className="space-y-4">
								<Card className="border-border/70 shadow-sm">
									<CardHeader>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<UsersIcon className="size-5 text-primary" />
												<CardTitle className="text-xl font-semibold">
													Usuarios registrados
												</CardTitle>
											</div>
											<span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
												{existingUsers.length} en total
											</span>
										</div>
										<CardDescription>
											Listado de cuentas existentes en la base de datos.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="divide-y divide-border/60">
											{existingUsers.map((u) => (
												<div
													key={u.id}
													className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
												>
													<div className="min-w-0">
														<p className="font-medium text-foreground truncate">
															{u.name}
														</p>
														<p className="text-xs text-muted-foreground truncate">
															{u.email}
														</p>
													</div>
													<div className="flex items-center gap-2 shrink-0">
														<span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
															{u.roleName ?? "Usuario"}
														</span>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</section>
						</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
