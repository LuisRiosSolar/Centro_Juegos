import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceiptTextIcon, ShieldAlertIcon } from "lucide-react";

import { AdminFinancialReportView } from "@/components/admin-financial-report-view";
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
import { getSessionFinancialReport } from "@/lib/game-sessions";

function getTodayString() {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Bogota",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return formatter.format(now);
}

export default async function AdminFinancialReportPage({
	searchParams,
}: {
	searchParams: Promise<{ desde?: string; hasta?: string; fecha?: string }>;
}) {
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
							Solo el personal administrativo autorizado puede consultar el reporte financiero y cierre de ingresos.
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

	const params = await searchParams;
	const today = getTodayString();
	const startDate = params.desde || params.fecha || today;
	const endDate = params.hasta || params.fecha || startDate;

	const { sessions, summary } = await getSessionFinancialReport(
		startDate,
		endDate,
	);

	return (
		<SidebarProvider>
			<AdminSidebar
				userName={access.name}
				userEmail={access.email}
				isRoot={access.isRoot}
				active="reportes"
			/>
			<SidebarInset>
				<main className="min-h-svh">
					<div className="flex w-full flex-col gap-6 px-4 py-5 lg:px-6">
						<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								<SidebarTrigger />
								<div>
									<div className="flex items-center gap-2">
										<p className="text-xs font-semibold uppercase tracking-wider text-primary">
											Finanzas y Cierre
										</p>
									</div>
									<h1 className="text-3xl font-bold tracking-tight text-foreground">
										Reporte de Sesiones y Cierre Diario
									</h1>
									<p className="mt-1 text-sm text-muted-foreground">
										Trazabilidad de ingresos diarios en COP, cobros de planes y adiciones de tiempo.
									</p>
								</div>
							</div>
						</header>

						<div className="w-full">
							<AdminFinancialReportView
								initialSessions={sessions}
								initialSummary={summary}
								initialStartDate={startDate}
								initialEndDate={endDate}
							/>
						</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
