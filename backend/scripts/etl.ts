import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// =============================================================================
//                 Prisma Client (adapter directo a PostgreSQL) 
// =============================================================================
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

// ==================== CARGA RAW (desde CSV a tablas raw.*)====================


// Order: Función para cargar los datos de órdenes desde el CSV. Se usa fs.createReadStream para leer el archivo y csv-parse para convertirlo en objetos.
async function loadRawOrders() {
  // Se crea un parser que lee el archivo CSV y lo convierte en filas con columnas nombradas.
  const parser = fs
    .createReadStream("data/olist_orders_dataset.csv")
    .pipe(parse({ columns: true }));
  // Se inicializa un arreglo vacío para almacenar las filas procesadas.
  const rows: any[] = [];
  // Se recorre cada fila del parser de manera asíncrona.
  for await (const row of parser) {
    // Se construye un objeto con los campos esperados en la tabla raw_orders.
    rows.push({
      order_id: row.order_id,
      customer_id: row.customer_id,
      order_status: row.order_status,
      order_purchase_timestamp: row.order_purchase_timestamp,
      order_approved_at: row.order_approved_at || null,
      order_delivered_carrier_date: row.order_delivered_carrier_date || null,
      order_delivered_customer_date: row.order_delivered_customer_date || null,
      order_estimated_delivery_date: row.order_estimated_delivery_date,
    });
  }
  // Se insertan todas las filas en la tabla raw_orders usando Prisma.
  //await prisma.raw_orders.createMany({ data: rows });
  await prisma.raw_orders.createMany({
    data: rows,
    skipDuplicates: true,
  });

  // Se imprime en consola cuántas filas fueron cargadas.
  console.log("RAW Orders cargados:", rows.length);
}

// Order Items: Función para cargar los ítems de las órdenes desde el CSV correspondiente.
async function loadRawOrderItems() {
  // Se crea el parser para leer el archivo olist_order_items_dataset.csv.
  const parser = fs
    .createReadStream("data/olist_order_items_dataset.csv")
    .pipe(parse({ columns: true }));
  const rows: any[] = [];
  // Se recorre cada fila del CSV.
  for await (const row of parser) {
    // Se construye el objeto con los campos de la tabla raw_order_items.
    rows.push({
      order_id: row.order_id,
      order_item_id: parseInt(row.order_item_id),
      product_id: row.product_id,
      seller_id: row.seller_id,
      shipping_limit_date: row.shipping_limit_date,
      price: row.price,
      freight_value: row.freight_value,
    });
  }
  // Se insertan los ítems en la tabla raw_order_items.
  await prisma.raw_order_items.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log("RAW Order Items cargados:", rows.length);
}

// Order Payments: Función para cargar los pagos de las órdenes desde el CSV.
async function loadRawOrderPayments() {
  const parser = fs
    .createReadStream("data/olist_order_payments_dataset.csv")
    .pipe(parse({ columns: true }));
  const rows: any[] = [];
  for await (const row of parser) {
    rows.push({
      order_id: row.order_id,
      payment_sequential: parseInt(row.payment_sequential),
      payment_type: row.payment_type,
      payment_installments: parseInt(row.payment_installments),
      payment_value: row.payment_value,
    });
  }
  // Se insertan los pagos en la tabla raw_order_payments.
  await prisma.raw_order_payments.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log("RAW Order Payments cargados:", rows.length);
}

// Products: Función para cargar los productos desde el CSV.
async function loadRawProducts() {
  const parser = fs
    .createReadStream("data/olist_products_dataset.csv")
    .pipe(parse({ columns: true }));
  const rows: any[] = [];
  for await (const row of parser) {
    rows.push({
      product_id: row.product_id,
      product_category_name: row.product_category_name || null,
      product_name_lenght: row.product_name_lenght
        ? parseInt(row.product_name_lenght)
        : null,
      product_description_lenght: row.product_description_lenght
        ? parseInt(row.product_description_lenght)
        : null,
      product_photos_qty: row.product_photos_qty
        ? parseInt(row.product_photos_qty)
        : null,
      product_weight_g: row.product_weight_g
        ? parseInt(row.product_weight_g)
        : null,
      product_length_cm: row.product_length_cm
        ? parseInt(row.product_length_cm)
        : null,
      product_height_cm: row.product_height_cm
        ? parseInt(row.product_height_cm)
        : null,
      product_width_cm: row.product_width_cm
        ? parseInt(row.product_width_cm)
        : null,
    });
  }
  // Se insertan los productos en la tabla raw_products.
  await prisma.raw_products.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log("RAW Products cargados:", rows.length);
}

// Customers: Función para cargar los clientes desde el CSV.
async function loadRawCustomers() {
  const parser = fs
    .createReadStream("data/olist_customers_dataset.csv")
    .pipe(parse({ columns: true }));
  const rows: any[] = [];
  for await (const row of parser) {
    rows.push({
      customer_id: row.customer_id,
      customer_unique_id: row.customer_unique_id,
      customer_zip_code_prefix: row.customer_zip_code_prefix,
      customer_city: row.customer_city,
      customer_state: row.customer_state,
    });
  }
  // Se insertan los clientes en la tabla raw_customers.
  await prisma.raw_customers.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log("RAW Customers cargados:", rows.length);
}


// Product Category TranslationFunción: para cargar la traducción de categorías de producto desde el CSV.
async function loadRawCategoryTranslation() {
  const parser = fs
    .createReadStream("data/product_category_name_translation.csv")
    .pipe(parse({ columns: true, skip_empty_lines: true }));

  const rows: any[] = [];
  for await (const row of parser) {
    const keys = Object.keys(row);
    // Verificamos que tengamos al menos dos claves (deberían existir siempre)
    if (keys.length >= 2 && keys[0] !== undefined && keys[1] !== undefined) {
      rows.push({
        product_category_name: row[keys[0]], // clave con posible BOM
        product_category_name_english: row[keys[1]], // segunda clave
      });
    }
  }
  await prisma.raw_product_category_name_translation.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log("RAW Category Translation cargados:", rows.length);
}

// =============================================================================
//              TRANSFORMACIÓN RAW → CLEAN (corrección de tipos)
// =============================================================================


async function transformRawToClean() {
  // Órdenes
  await prisma.$executeRawUnsafe(`
    INSERT INTO clean.orders
    SELECT order_id, customer_id, order_status,
           CAST(order_purchase_timestamp AS TIMESTAMP),
           CAST(order_approved_at AS TIMESTAMP),
           CAST(order_delivered_carrier_date AS TIMESTAMP),
           CAST(order_delivered_customer_date AS TIMESTAMP),
           CAST(order_estimated_delivery_date AS TIMESTAMP)
    FROM raw.orders
    ON CONFLICT (order_id) DO NOTHING;
  `);

  // Ítems
  await prisma.$executeRawUnsafe(`
    INSERT INTO clean.order_items
    SELECT order_id, order_item_id, product_id, seller_id,
           CAST(shipping_limit_date AS TIMESTAMP),
           CAST(price AS DECIMAL),
           CAST(freight_value AS DECIMAL)
    FROM raw.order_items
    ON CONFLICT (order_id, order_item_id) DO NOTHING;
  `);

  // Pagos
  await prisma.$executeRawUnsafe(`
    INSERT INTO clean.order_payments
    SELECT order_id, payment_sequential, payment_type, payment_installments,
           CAST(payment_value AS DECIMAL)
    FROM raw.order_payments
    ON CONFLICT (order_id, payment_sequential) DO NOTHING;
  `);

  // Productos
  await prisma.$executeRawUnsafe(`
    INSERT INTO clean.products
    SELECT product_id, product_category_name, product_name_lenght,
           product_description_lenght, product_photos_qty,
           product_weight_g, product_length_cm, product_height_cm, product_width_cm
    FROM raw.products
    ON CONFLICT (product_id) DO NOTHING;
  `);

  // Clientes
  await prisma.$executeRawUnsafe(`
    INSERT INTO clean.customers
    SELECT customer_id, customer_unique_id, customer_zip_code_prefix,
           customer_city, customer_state
    FROM raw.customers
    ON CONFLICT (customer_id) DO NOTHING;
  `);

  // Traducción de categorías
  await prisma.$executeRawUnsafe(`
    INSERT INTO clean.product_category_name_translation
    SELECT product_category_name, product_category_name_english
    FROM raw.product_category_name_translation
    ON CONFLICT (product_category_name) DO NOTHING;
  `);

  console.log("Transformación RAW → CLEAN completada");
}

// =============================================================================
//                      POBLACION DEL MODELO ESTRELLA - DWH 
// =============================================================================


// Pobla la dimensión de clientes con datos únicos desde CLEAN.
async function populateDimCustomer() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO dwh.dim_customer (customer_id, customer_city, customer_state)
    SELECT DISTINCT customer_id, customer_city, customer_state
    FROM clean.customers
    ON CONFLICT (customer_id) DO NOTHING;
  `);
}

// Pobla la dimensión de productos con datos únicos desde CLEAN.
async function populateDimProduct() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO dwh.dim_product (product_id, product_category, product_name_lenght,
                                 product_description_lenght, product_photos_qty,
                                 product_weight_g, product_length_cm, product_height_cm, product_width_cm)
    SELECT DISTINCT product_id, product_category_name, product_name_lenght,
           product_description_lenght, product_photos_qty,
           product_weight_g, product_length_cm, product_height_cm, product_width_cm
    FROM clean.products
    ON CONFLICT (product_id) DO NOTHING;
  `);
}

// Pobla la dimensión de fechas extrayendo año, mes, día y día de la semana desde CLEAN.
async function populateDimDate() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO dwh.dim_date (full_date, year, month, day, day_of_week)
    SELECT DISTINCT order_purchase_timestamp::date,
           EXTRACT(YEAR FROM order_purchase_timestamp),
           EXTRACT(MONTH FROM order_purchase_timestamp),
           EXTRACT(DAY FROM order_purchase_timestamp),
           EXTRACT(DOW FROM order_purchase_timestamp)
    FROM clean.orders
    ON CONFLICT (full_date) DO NOTHING;
  `);
}

// Pobla la dimensión de órdenes con datos únicos desde CLEAN.
async function populateDimOrder() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO dwh.dim_order (order_id, order_status, order_purchase_timestamp,
                               order_delivered_customer_date, order_estimated_delivery_date)
    SELECT DISTINCT order_id, order_status, order_purchase_timestamp,
           order_delivered_customer_date, order_estimated_delivery_date
    FROM clean.orders
    ON CONFLICT (order_id) DO NOTHING;
  `);
}

// Pobla la tabla de hechos fact_sales aplicando prorrateo de pagos y generando flags.
async function populateFactSales() {
  await prisma.$executeRawUnsafe(`
     WITH order_totals AS (
       SELECT order_id, SUM(price) AS order_total_price
       FROM clean.order_items
       GROUP BY order_id
     ),
     payments_summed AS (
       SELECT order_id, SUM(payment_value) AS total_payment
       FROM clean.order_payments
       GROUP BY order_id
     )
     INSERT INTO dwh.fact_sales (
       order_id,
       order_item_id,
       date_key,
       product_key,
       customer_key,
       order_key,
       item_price,
       freight_value,
       payment_value_allocated,
       is_delivered,
       is_canceled,
       is_on_time
     )
     SELECT 
       oi.order_id,
       oi.order_item_id,
       dd.date_key,
       dp.product_key,
       dc.customer_key,
       ord.order_key,
       oi.price,
       oi.freight_value,
       COALESCE((oi.price / ot.order_total_price) * ps.total_payment, 0) AS payment_value_allocated,
      CASE WHEN o.order_status = 'delivered' THEN TRUE ELSE FALSE END AS is_delivered,
      CASE WHEN o.order_status = 'canceled' THEN TRUE ELSE FALSE END AS is_canceled,
      CASE WHEN o.order_delivered_customer_date <= o.order_estimated_delivery_date THEN TRUE ELSE FALSE END AS is_on_time
    FROM clean.order_items oi
    JOIN order_totals ot ON oi.order_id = ot.order_id
    LEFT JOIN payments_summed ps ON oi.order_id = ps.order_id
    JOIN clean.orders o ON oi.order_id = o.order_id
    JOIN dwh.dim_customer dc ON dc.customer_id = o.customer_id
    JOIN dwh.dim_product dp ON dp.product_id = oi.product_id
    JOIN dwh.dim_order ord ON ord.order_id = o.order_id
    JOIN dwh.dim_date dd ON dd.full_date::date = o.order_purchase_timestamp::date
    ON CONFLICT (order_id, order_item_id) DO NOTHING; 
   `);

  console.log("Fact Sales poblada con prorrateo de pagos");
}

//==============================================================================
//                     ORQUESTADOR PRINCIPAL
//==============================================================================

// Función principal que ejecuta todo el flujo ETL en orden.
async function main() {
  // Carga de datos RAW desde los CSV.
  await loadRawOrders();
  await loadRawOrderItems();
  await loadRawOrderPayments();
  await loadRawProducts();
  await loadRawCustomers();
  await loadRawCategoryTranslation();

  // Transformación de RAW a CLEAN con tipos correctos.
  await transformRawToClean();

  // Poblamiento de dimensiones y tabla de hechos en DWH.
  await populateDimCustomer();
  await populateDimProduct();
  await populateDimDate();
  await populateDimOrder();
  await populateFactSales();

  // Desconexión de Prisma al finalizar el proceso.
  await prisma.$disconnect();
}

// Ejecución del script ETL con manejo de errores.
main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
