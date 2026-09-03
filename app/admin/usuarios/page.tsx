import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlertIcon } from "lucide-react";

import { AdminCreateUserDialog } from "@/components/admin-create-user-dialog";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminUsersListView } from "@/components/admin-users-list-view";
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
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Administración
									</p>
									<h1 className="text-3xl font-bold tracking-tight text-foreground">
										Gestión de usuarios
									</h1>
									<p className="mt-1 text-sm text-muted-foreground">
										Cuentas autorizadas para operar y administrar el centro de juegos.
									</p>
								</div>
							</div>
							<AdminCreateUserDialog />
						</header>

						<div className="w-full">
							<AdminUsersListView users={existingUsers} />
						</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
