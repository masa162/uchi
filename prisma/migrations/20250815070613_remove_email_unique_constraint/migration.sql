/*
  Warnings:

  - You are about to drop the column `category` on the `articles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "public"."articles" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "email" DROP NOT NULL;
