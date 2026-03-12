-- CreateTable
CREATE TABLE "scales" (
    "id" SERIAL NOT NULL,
    "hour" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_scales" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "scale_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_scales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scales_hour_key" ON "scales"("hour");

-- AddForeignKey
ALTER TABLE "user_scales" ADD CONSTRAINT "user_scales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scales" ADD CONSTRAINT "user_scales_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
