-- Existing accounts were created by this application through email/password,
-- whose Better Auth issuer is always `local:credential`.
ALTER TABLE "account" ADD COLUMN "issuer" text DEFAULT 'local:credential';--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" ("issuer","account_id");