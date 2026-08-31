import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id
		}),
	},
	user: {
		accounts: r.many.account(),
		sesionJuegosViaExtensionTiempo: r.many.sesionJuego({
			from: r.user.id.through(r.extensionTiempo.creadoPor),
			to: r.sesionJuego.id.through(r.extensionTiempo.sesionJuegoId),
			alias: "user_id_sesionJuego_id_via_extensionTiempo"
		}),
		sesionJuegosViaPago: r.many.sesionJuego({
			from: r.user.id.through(r.pago.creadoPor),
			to: r.sesionJuego.id.through(r.pago.sesionJuegoId),
			alias: "user_id_sesionJuego_id_via_pago"
		}),
		sesionJuegosCreadoPor: r.many.sesionJuego({
			alias: "sesionJuego_creadoPor_user_id"
		}),
		sessions: r.many.session(),
		rol: r.one.rol({
			from: r.user.roleId,
			to: r.rol.id
		}),
	},
	cliente: {
		responsable: r.one.responsable({
			from: r.cliente.responsableId,
			to: r.responsable.id
		}),
		sesionJuegos: r.many.sesionJuego(),
	},
	responsable: {
		clientes: r.many.cliente(),
	},
	sesionJuego: {
		usersViaExtensionTiempo: r.many.user({
			alias: "user_id_sesionJuego_id_via_extensionTiempo"
		}),
		usersViaPago: r.many.user({
			alias: "user_id_sesionJuego_id_via_pago"
		}),
		cliente: r.one.cliente({
			from: r.sesionJuego.clienteId,
			to: r.cliente.id
		}),
		user: r.one.user({
			from: r.sesionJuego.creadoPor,
			to: r.user.id,
			alias: "sesionJuego_creadoPor_user_id"
		}),
		planTiempo: r.one.planTiempo({
			from: r.sesionJuego.planTiempoId,
			to: r.planTiempo.id
		}),
	},
	planTiempo: {
		sesionJuegos: r.many.sesionJuego(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id
		}),
	},
	rol: {
		users: r.many.user(),
	},
}))