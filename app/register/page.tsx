import { redirect } from "next/navigation";

export default function Page() {
	// Registration is managed by a super administrator from the admin panel.
	redirect("/login");
}
