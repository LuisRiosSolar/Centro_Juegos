import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "../../../../lib/auth";

// Create the Better Auth handler only when a request arrives, not during
// `next build`, where runtime environment variables are unavailable.
type AuthHandlers = ReturnType<typeof toNextJsHandler>;
let handlers: AuthHandlers | undefined;

function getHandlers(): AuthHandlers {
	return (handlers ??= toNextJsHandler(auth.handler));
}

export function GET(request: Request) {
	return getHandlers().GET(request);
}

export function POST(request: Request) {
	return getHandlers().POST(request);
}
