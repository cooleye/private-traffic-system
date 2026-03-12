-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "short_links" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "short_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "short_link_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "device_type" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "province" TEXT,
    "city" TEXT,
    "referrer" TEXT,
    "action" TEXT NOT NULL DEFAULT 'VIEW',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visit_logs_short_link_id_fkey" FOREIGN KEY ("short_link_id") REFERENCES "short_links" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "short_links_short_code_key" ON "short_links"("short_code");

-- CreateIndex
CREATE INDEX "short_links_user_id_idx" ON "short_links"("user_id");

-- CreateIndex
CREATE INDEX "short_links_short_code_idx" ON "short_links"("short_code");

-- CreateIndex
CREATE INDEX "short_links_platform_idx" ON "short_links"("platform");

-- CreateIndex
CREATE INDEX "visit_logs_short_link_id_idx" ON "visit_logs"("short_link_id");

-- CreateIndex
CREATE INDEX "visit_logs_created_at_idx" ON "visit_logs"("created_at");

-- CreateIndex
CREATE INDEX "templates_user_id_idx" ON "templates"("user_id");

-- CreateIndex
CREATE INDEX "templates_platform_idx" ON "templates"("platform");
