-- CreateTable
CREATE TABLE "conversion_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "short_link_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "country" TEXT,
    "province" TEXT,
    "city" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversion_logs_short_link_id_fkey" FOREIGN KEY ("short_link_id") REFERENCES "short_links" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_short_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "short_code" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_value" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "cover_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" DATETIME,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "conversion_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "short_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_short_links" ("click_count", "cover_image", "created_at", "description", "expires_at", "id", "platform", "short_code", "status", "target_type", "target_value", "title", "updated_at", "user_id") SELECT "click_count", "cover_image", "created_at", "description", "expires_at", "id", "platform", "short_code", "status", "target_type", "target_value", "title", "updated_at", "user_id" FROM "short_links";
DROP TABLE "short_links";
ALTER TABLE "new_short_links" RENAME TO "short_links";
CREATE UNIQUE INDEX "short_links_short_code_key" ON "short_links"("short_code");
CREATE INDEX "short_links_user_id_idx" ON "short_links"("user_id");
CREATE INDEX "short_links_short_code_idx" ON "short_links"("short_code");
CREATE INDEX "short_links_platform_idx" ON "short_links"("platform");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "conversion_logs_short_link_id_idx" ON "conversion_logs"("short_link_id");

-- CreateIndex
CREATE INDEX "conversion_logs_session_id_idx" ON "conversion_logs"("session_id");

-- CreateIndex
CREATE INDEX "conversion_logs_created_at_idx" ON "conversion_logs"("created_at");
