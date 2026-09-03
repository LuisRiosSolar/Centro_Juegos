import { redirect } from "next/navigation";

import { BrandCustomizer } from "@/components/brand-customizer";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAdminAccess } from "@/lib/admin-auth";

export default async function PersonalizacionPage() {
	const access = await getAdminAccess();

	// Redirigir si no está autenticado
	if (!access.ok && access.reason === "unauthenticated") {
		redirect("/login");
	}

	// Solo superadmin puede acceder
	if (!access.ok || !access.isRoot) {
		redirect("/admin");
	}

	return (
		<SidebarProvider>
			<AdminSidebar
				userName={access.name}
				userEmail={access.email}
				isRoot={access.isRoot}
				active="personalizacion"
			/>
			<SidebarInset>
				<main className="min-h-svh">
					<div className="flex w-full flex-col gap-6 px-4 py-5 lg:px-6">
						{/* Header */}
						<header className="flex items-center gap-3">
							<SidebarTrigger />
							<div>
								<p className="text-sm text-muted-foreground">
									Superadministrador
								</p>
								<h1 className="text-3xl font-semibold tracking-tight">
									Personalización
								</h1>
							</div>
						</header>

						{/* Panel de personalización */}
						<div className="mx-auto w-full max-w-3xl">
							<BrandCustomizer />
						</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
