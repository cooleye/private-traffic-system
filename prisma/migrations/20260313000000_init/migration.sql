-- PostgreSQL 初始化迁移
-- 这个迁移文件用于 Vercel 生产环境（PostgreSQL）

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "membership_type" TEXT NOT NULL DEFAULT 'TRIAL',
    "membership_expire_at" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_expire_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: users
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateTable: short_links
CREATE TABLE "short_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "short_code" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_value" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "cover_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "conversion_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: short_links
CREATE UNIQUE INDEX "short_links_short_code_key" ON "short_links"("short_code");
CREATE INDEX "short_links_user_id_idx" ON "short_links"("user_id");
CREATE INDEX "short_links_short_code_idx" ON "short_links"("short_code");
CREATE INDEX "short_links_platform_idx" ON "short_links"("platform");

-- AddForeignKey: short_links -> users
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: visit_logs
CREATE TABLE "visit_logs" (
    "id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: visit_logs
CREATE INDEX "visit_logs_short_link_id_idx" ON "visit_logs"("short_link_id");
CREATE INDEX "visit_logs_created_at_idx" ON "visit_logs"("created_at");

-- AddForeignKey: visit_logs -> short_links
ALTER TABLE "visit_logs" ADD CONSTRAINT "visit_logs_short_link_id_fkey" 
    FOREIGN KEY ("short_link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: visit_logs -> users
ALTER TABLE "visit_logs" ADD CONSTRAINT "visit_logs_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: conversion_logs
CREATE TABLE "conversion_logs" (
    "id" TEXT NOT NULL,
    "short_link_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "country" TEXT,
    "province" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: conversion_logs
CREATE INDEX "conversion_logs_short_link_id_idx" ON "conversion_logs"("short_link_id");
CREATE INDEX "conversion_logs_session_id_idx" ON "conversion_logs"("session_id");
CREATE INDEX "conversion_logs_created_at_idx" ON "conversion_logs"("created_at");

-- AddForeignKey: conversion_logs -> short_links
ALTER TABLE "conversion_logs" ADD CONSTRAINT "conversion_logs_short_link_id_fkey" 
    FOREIGN KEY ("short_link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: templates
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: templates
CREATE INDEX "templates_user_id_idx" ON "templates"("user_id");
CREATE INDEX "templates_platform_idx" ON "templates"("platform");

-- AddForeignKey: templates -> users
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
