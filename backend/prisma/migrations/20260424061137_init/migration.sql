-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "clean";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dwh";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "raw";

-- CreateTable
CREATE TABLE "raw"."orders" (
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_status" TEXT NOT NULL,
    "order_purchase_timestamp" TEXT NOT NULL,
    "order_approved_at" TEXT,
    "order_delivered_carrier_date" TEXT,
    "order_delivered_customer_date" TEXT,
    "order_estimated_delivery_date" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "raw"."order_items" (
    "order_id" TEXT NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "shipping_limit_date" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "freight_value" TEXT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_id","order_item_id")
);

-- CreateTable
CREATE TABLE "raw"."order_payments" (
    "order_id" TEXT NOT NULL,
    "payment_sequential" INTEGER NOT NULL,
    "payment_type" TEXT NOT NULL,
    "payment_installments" INTEGER NOT NULL,
    "payment_value" TEXT NOT NULL,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("order_id","payment_sequential")
);

-- CreateTable
CREATE TABLE "raw"."products" (
    "product_id" TEXT NOT NULL,
    "product_category_name" TEXT,
    "product_name_lenght" INTEGER,
    "product_description_lenght" INTEGER,
    "product_photos_qty" INTEGER,
    "product_weight_g" INTEGER,
    "product_length_cm" INTEGER,
    "product_height_cm" INTEGER,
    "product_width_cm" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "raw"."customers" (
    "customer_id" TEXT NOT NULL,
    "customer_unique_id" TEXT NOT NULL,
    "customer_zip_code_prefix" TEXT NOT NULL,
    "customer_city" TEXT NOT NULL,
    "customer_state" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "raw"."product_category_name_translation" (
    "product_category_name" TEXT NOT NULL,
    "product_category_name_english" TEXT NOT NULL,

    CONSTRAINT "product_category_name_translation_pkey" PRIMARY KEY ("product_category_name")
);

-- CreateTable
CREATE TABLE "clean"."orders" (
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_status" TEXT NOT NULL,
    "order_purchase_timestamp" TIMESTAMP(3) NOT NULL,
    "order_approved_at" TIMESTAMP(3),
    "order_delivered_carrier_date" TIMESTAMP(3),
    "order_delivered_customer_date" TIMESTAMP(3),
    "order_estimated_delivery_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "clean"."order_items" (
    "order_id" TEXT NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "product_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "shipping_limit_date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "freight_value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_id","order_item_id")
);

-- CreateTable
CREATE TABLE "clean"."order_payments" (
    "order_id" TEXT NOT NULL,
    "payment_sequential" INTEGER NOT NULL,
    "payment_type" TEXT NOT NULL,
    "payment_installments" INTEGER NOT NULL,
    "payment_value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("order_id","payment_sequential")
);

-- CreateTable
CREATE TABLE "clean"."products" (
    "product_id" TEXT NOT NULL,
    "product_category_name" TEXT,
    "product_name_lenght" INTEGER,
    "product_description_lenght" INTEGER,
    "product_photos_qty" INTEGER,
    "product_weight_g" INTEGER,
    "product_length_cm" INTEGER,
    "product_height_cm" INTEGER,
    "product_width_cm" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "clean"."customers" (
    "customer_id" TEXT NOT NULL,
    "customer_unique_id" TEXT NOT NULL,
    "customer_zip_code_prefix" TEXT NOT NULL,
    "customer_city" TEXT NOT NULL,
    "customer_state" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "clean"."product_category_name_translation" (
    "product_category_name" TEXT NOT NULL,
    "product_category_name_english" TEXT NOT NULL,

    CONSTRAINT "product_category_name_translation_pkey" PRIMARY KEY ("product_category_name")
);

-- CreateTable
CREATE TABLE "dwh"."dim_date" (
    "date_key" SERIAL NOT NULL,
    "full_date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,

    CONSTRAINT "dim_date_pkey" PRIMARY KEY ("date_key")
);

-- CreateTable
CREATE TABLE "dwh"."dim_customer" (
    "customer_key" SERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "customer_city" TEXT,
    "customer_state" TEXT,

    CONSTRAINT "dim_customer_pkey" PRIMARY KEY ("customer_key")
);

-- CreateTable
CREATE TABLE "dwh"."dim_product" (
    "product_key" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_category" TEXT,
    "product_name_lenght" INTEGER,
    "product_description_lenght" INTEGER,
    "product_photos_qty" INTEGER,
    "product_weight_g" INTEGER,
    "product_length_cm" INTEGER,
    "product_height_cm" INTEGER,
    "product_width_cm" INTEGER,

    CONSTRAINT "dim_product_pkey" PRIMARY KEY ("product_key")
);

-- CreateTable
CREATE TABLE "dwh"."dim_order" (
    "order_key" SERIAL NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_status" TEXT NOT NULL,
    "order_purchase_timestamp" TIMESTAMP(3) NOT NULL,
    "order_delivered_customer_date" TIMESTAMP(3),
    "order_estimated_delivery_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dim_order_pkey" PRIMARY KEY ("order_key")
);

-- CreateTable
CREATE TABLE "dwh"."fact_sales" (
    "sales_key" SERIAL NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_item_id" INTEGER NOT NULL,
    "date_key" INTEGER NOT NULL,
    "product_key" INTEGER NOT NULL,
    "customer_key" INTEGER NOT NULL,
    "order_key" INTEGER NOT NULL,
    "item_price" DECIMAL(65,30) NOT NULL,
    "freight_value" DECIMAL(65,30) NOT NULL,
    "payment_value_allocated" DECIMAL(65,30) NOT NULL,
    "is_delivered" BOOLEAN NOT NULL,
    "is_canceled" BOOLEAN NOT NULL,
    "is_on_time" BOOLEAN NOT NULL,

    CONSTRAINT "fact_sales_pkey" PRIMARY KEY ("sales_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "dim_date_full_date_key" ON "dwh"."dim_date"("full_date");

-- CreateIndex
CREATE UNIQUE INDEX "dim_customer_customer_id_key" ON "dwh"."dim_customer"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "dim_product_product_id_key" ON "dwh"."dim_product"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "dim_order_order_id_key" ON "dwh"."dim_order"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "fact_sales_order_id_order_item_id_key" ON "dwh"."fact_sales"("order_id", "order_item_id");

-- AddForeignKey
ALTER TABLE "dwh"."fact_sales" ADD CONSTRAINT "fact_sales_date_key_fkey" FOREIGN KEY ("date_key") REFERENCES "dwh"."dim_date"("date_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dwh"."fact_sales" ADD CONSTRAINT "fact_sales_product_key_fkey" FOREIGN KEY ("product_key") REFERENCES "dwh"."dim_product"("product_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dwh"."fact_sales" ADD CONSTRAINT "fact_sales_customer_key_fkey" FOREIGN KEY ("customer_key") REFERENCES "dwh"."dim_customer"("customer_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dwh"."fact_sales" ADD CONSTRAINT "fact_sales_order_key_fkey" FOREIGN KEY ("order_key") REFERENCES "dwh"."dim_order"("order_key") ON DELETE RESTRICT ON UPDATE CASCADE;
