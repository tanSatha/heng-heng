-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT,
ALTER COLUMN "provider_id" DROP NOT NULL;
