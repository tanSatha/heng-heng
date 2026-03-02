-- CreateEnum
CREATE TYPE "LotteryType" AS ENUM ('THAI', 'LAO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temple" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "totalHits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Temple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotteryRecord" (
    "id" SERIAL NOT NULL,
    "numbers" TEXT NOT NULL,
    "type" "LotteryType" NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "isWin" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "templeId" INTEGER NOT NULL,

    CONSTRAINT "LotteryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_providerId_key" ON "User"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Temple_name_key" ON "Temple"("name");

-- AddForeignKey
ALTER TABLE "LotteryRecord" ADD CONSTRAINT "LotteryRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryRecord" ADD CONSTRAINT "LotteryRecord_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
