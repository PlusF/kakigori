-- CreateTable
CREATE TABLE "Serving" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Serving_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Serving_orderId_idx" ON "Serving"("orderId");

-- AddForeignKey
ALTER TABLE "Serving" ADD CONSTRAINT "Serving_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
