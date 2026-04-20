# Dashboard de Ventas Olist - Prueba Técnica Full-Stack

Este proyecto implementa un dashboard analítico sobre el dataset público de Olist.

## 🚀 Cómo Ejecutar

### Requisitos

- Docker y Docker Compose instalados.

### Pasos

1. Clonar el repositorio.
2. Copiar `.env.example` a `.env`.
3. Ejecutar `docker-compose up --build`.
4. Acceder al frontend en `http://localhost:3000` y al backend en `http://localhost:3001/health`.

El comando `up` se encargará de:

- Levantar la base de datos PostgreSQL.
- Ejecutar las migraciones de Prisma para crear los esquemas `raw`, `clean` y `dwh`.
- Ejecutar el script de ETL que descarga los CSVs (si no están) y los carga en `raw`, luego los transforma a `clean` y finalmente construye el esquema estrella en `dwh`.
- Iniciar el servidor backend y frontend.

---

## 🏛️ Arquitectura

### Backend (Node.js + Express + TypeScript)

Arquitectura Hexagonal (Puertos y Adaptadores):

- **`src/domain`**: Entidades de negocio y contratos de repositorios.
- **`src/application`**: Casos de uso que orquestan el flujo de datos.
- **`src/infrastructure`**: Implementaciones de repositorios con Prisma (solo sobre `dwh`).
- **`src/adapters/http`**: Controladores REST con Express.

**Regla crítica cumplida:** El backend consulta únicamente el esquema `dwh`.

### Frontend (Next.js 14 + TypeScript + TailwindCSS)

- App Router de Next.js.
- Componentes de servidor y cliente.
- Consumo de API vía `fetch`.
- Librerías: Recharts, date-fns, Zod.

---

## 📂 Modelo de Datos y ETL

### Tablas cargadas en `raw`

- `raw_orders`
- `raw_order_items`
- `raw_order_payments`
- `raw_products`
- `raw_customers`
- `raw_product_category_name_translation`

### Reglas de limpieza (`clean`)

- Conversión de tipos `TEXT` → `TIMESTAMP`, `DECIMAL`, `INT`.
- Manejo de valores nulos (`NULL` en campos opcionales).
- Normalización de categorías y traducciones.

### Definición del Star Schema (`dwh`)

- **Grano de `fact_sales`**: 1 fila por ítem de orden (`order_id` + `order_item_id`).
- **Dimensiones**:
  - `dim_date` (atributos de fecha).
  - `dim_customer` (ubicación del cliente).
  - `dim_product` (atributos del producto).
  - `dim_order` (estado y fechas de la orden).
- **Asignación de `payment_value`**:
  - Se aplica **prorrateo proporcional** al precio de cada ítem.
  - Fórmula: `(item_price / total_order_price) * total_payment`.

---

## 📊 KPIs Implementados

- **GMV**: `SUM(fact_sales.item_price)`
- **Revenue**: `SUM(fact_sales.payment_value_allocated)`
- **On-Time Delivery Rate**: proporción de órdenes con `delivered_date <= estimated_date`.
- **Cancel Rate**: proporción de órdenes con `order_status = 'canceled'`.
- **Orders Count**: `COUNT(DISTINCT order_id)`

---

## 🧪 Tests

- **Unitarios (mínimo 3)**:
  - Validación de entidades de dominio (`Sale`, `KPI`).
  - Casos de uso (`GetKpisUseCase`, `GetTopProductsUseCase`).
  - Reglas de negocio (ej. prorrateo de pagos).

- **Integración (opcional)**:
  - Test de API `/health` y `/kpis`.

- **Calidad**:
  - Linting con ESLint + Prettier.
  - Manejo consistente de errores HTTP (400, 404, 500).

---

## ⚖️ Decisiones Técnicas y Tradeoffs

- **Prisma vs TypeORM**: Se eligió Prisma por su tipado fuerte y soporte de múltiples esquemas.
- **Prorrateo de pagos**: Se prefirió proporcional al precio de ítem para evitar sesgos en órdenes con múltiples productos.
- **Hexagonal Architecture**: Aísla lógica de negocio de infraestructura, facilitando testeo y mantenibilidad.
- **Docker Compose**: Simplifica la ejecución con servicios aislados (frontend, backend, base de datos).

---

## 📐 Diagrama del Modelo Estrella (simplificado)

```text
                +-------------------+
                |     dim_date      |
                | date_key, year... |
                +---------+---------+
                          |
                          |
+----------------+        |        +------------------+
|  dim_customer  |        |        |   dim_product    |
| customer_key   |        |        | product_key      |
+--------+-------+        |        +---------+--------+
         |                |                  |
         v                v                  v
                +-------------------+
                |    fact_sales     |
                | order_id, item... |
                | metrics, flags    |
                +-------------------+
                          ^
                          |
                +---------+---------+
                |     dim_order     |
                | order_key, status |
                +-------------------+
```

## 📐 Diagrama del Modelo Estrella Visual

```mermaid
erDiagram
    dim_date {
        int date_key PK
        datetime full_date
        int year
        int month
        int day
        int day_of_week
    }

    dim_customer {
        int customer_key PK
        string customer_id
        string customer_city
        string customer_state
    }

    dim_product {
        int product_key PK
        string product_id
        string product_category
        int product_name_lenght
        int product_description_lenght
        int product_photos_qty
        int product_weight_g
        int product_length_cm
        int product_height_cm
        int product_width_cm
    }

    dim_order {
        int order_key PK
        string order_id
        string order_status
        datetime order_purchase_timestamp
        datetime order_delivered_customer_date
        datetime order_estimated_delivery_date
    }

    fact_sales {
        int sales_key PK
        string order_id
        int order_item_id
        decimal item_price
        decimal freight_value
        decimal payment_value_allocated
        boolean is_delivered
        boolean is_canceled
        boolean is_on_time
        int date_key FK
        int product_key FK
        int customer_key FK
        int order_key FK
    }

    dim_date ||--o{ fact_sales : "date_key"
    dim_customer ||--o{ fact_sales : "customer_key"
    dim_product ||--o{ fact_sales : "product_key"
    dim_order ||--o{ fact_sales : "order_key"
```

## 🔄 Diagrama de Flujo ETL

```mermaid
flowchart TD
    A[CSV Dataset Olist] --> B[Esquema RAW]
    B -->|Conversión de tipos, manejo de nulos| C[Esquema CLEAN]
    C -->|Transformación analítica, joins, prorrateo de pagos| D[Esquema DWH (Star Schema)]

    B:::raw
    C:::clean
    D:::dwh

    classDef raw fill:#f9f,stroke:#333,stroke-width:2px;
    classDef clean fill:#bbf,stroke:#333,stroke-width:2px;
    classDef dwh fill:#bfb,stroke:#333,stroke-width:2px;
```

## Arquitectura Backend(Hexagonal)

flowchart TB
subgraph Domain
D1[Entidades de negocio]
D2[Interfaces (Ports)]
end

    subgraph Application
        A1[Casos de Uso]
    end

    subgraph Infrastructure
        I1[PrismaSalesRepository]
        I2[Conexión a PostgreSQL (DWH)]
    end

    subgraph Adapters
        H1[HTTP Controllers (Express)]
        H2[DTO Validation]
    end

    %% Relaciones
    D1 --> D2
    A1 --> D2
    I1 --> D2
    H1 --> A1
    H2 --> H1
```
