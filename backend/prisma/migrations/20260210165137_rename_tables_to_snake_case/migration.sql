/*
  Warnings:

  - You are about to drop the `LotteryRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Temple` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LotteryRecord" DROP CONSTRAINT "LotteryRecord_templeId_fkey";

-- DropForeignKey
ALTER TABLE "LotteryRecord" DROP CONSTRAINT "LotteryRecord_userId_fkey";

-- DropTable
DROP TABLE "LotteryRecord";

-- DropTable
DROP TABLE "Temple";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temples" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "total_hits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "temples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lottery_records" (
    "id" SERIAL NOT NULL,
    "numbers" TEXT NOT NULL,
    "type" "LotteryType" NOT NULL,
    "draw_date" TIMESTAMP(3) NOT NULL,
    "is_win" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "temple_id" INTEGER NOT NULL,

    CONSTRAINT "lottery_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "temples_name_key" ON "temples"("name");

-- AddForeignKey
ALTER TABLE "lottery_records" ADD CONSTRAINT "lottery_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lottery_records" ADD CONSTRAINT "lottery_records_temple_id_fkey" FOREIGN KEY ("temple_id") REFERENCES "temples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
