-- Add duplicate detection columns to scenarios table
ALTER TABLE "Scenario" ADD COLUMN IF NOT EXISTS "content_hash" TEXT;
ALTER TABLE "Scenario" ADD COLUMN IF NOT EXISTS "duplicate_checked" BOOLEAN DEFAULT false;
ALTER TABLE "Scenario" ADD COLUMN IF NOT EXISTS "duplicate_of" TEXT;

-- Create index for faster hash lookups
CREATE INDEX IF NOT EXISTS "Scenario_content_hash_idx" ON "Scenario"("content_hash");
