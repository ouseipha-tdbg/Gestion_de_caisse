-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('COMMERCE', 'SERVICE');

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "total" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "unitPrice" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Ma Boutique',
    "companyLogo" TEXT,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "receiptFooter" TEXT DEFAULT 'Merci de votre visite !',
    "shopType" "ShopType" NOT NULL DEFAULT 'COMMERCE',
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappTarget" TEXT,
    "whatsappSendTime" TEXT NOT NULL DEFAULT '20:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
