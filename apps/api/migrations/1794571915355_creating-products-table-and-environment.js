/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql(`
            CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');

            CREATE TABLE products (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            category_id bigint NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
            brand_id bigint REFERENCES brands (id) ON DELETE RESTRICT,
            name text NOT NULL,
            slug text NOT NULL UNIQUE,
            description text,
            status product_status NOT NULL DEFAULT 'draft',
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
            );

            CREATE INDEX products_categories_status_idx ON products (category_id, status);
            CREATE INDEX products_brand_id_idx ON products (brand_id);

            CREATE TRIGGER products_set_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();

            CREATE TABLE product_variants (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            product_id bigint NOT NULL REFERENCES products (id) ON DELETE CASCADE,
            sku text NOT NULL UNIQUE,
            price numeric(12, 2) NOT NULL CHECK (price >=0),
            old_price numeric(12, 2) CHECK (old_price IS NULL OR old_price >= price),
            stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
            is_default boolean NOT NULL DEFAULT false,
            barcode text,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
            );

            CREATE INDEX product_variants_product_id_idx ON product_variants (product_id);

            CREATE UNIQUE INDEX product_variants_one_default_idx 
                ON product_variants (product_id)
                WHERE is_default;

            CREATE TRIGGER product_variants_set_updated_at
            BEFORE UPDATE ON product_variants
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();


            CREATE TABLE product_images (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            product_id bigint REFERENCES products (id) ON DELETE CASCADE,
            variant_id bigint REFERENCES product_variants (id) ON DELETE CASCADE,
            url text NOT NULL,
            alt text,
            sort_order int NOT NULL DEFAULT 0,
            CHECK(
                (product_id IS NOT NULL AND variant_id IS NULL)
                OR 
                (product_id IS NULL AND variant_id IS NOT NULL)
            )
            );

            CREATE INDEX product_images_products_id_idx ON product_images (product_id);
            CREATE INDEX product_images_variant_id_idx ON product_images (variant_id);

            CREATE TABLE product_attribute_values (
            product_id bigint NOT NULL REFERENCES products (id) ON DELETE CASCADE,
            attribute_id bigint NOT NULL REFERENCES attributes (id) ON DELETE CASCADE,
            option_id bigint NOT NULL REFERENCES attribute_options (id) ON DELETE RESTRICT,
            value_num numeric,
            value_text text,
            value_bool boolean,
            PRIMARY KEY (product_id, attribute_id)
            );
        
            CREATE TABLE variant_attribute_values (
            variant_id   bigint NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
            attribute_id bigint NOT NULL REFERENCES attributes (id) ON DELETE CASCADE,
            option_id    bigint REFERENCES attribute_options (id) ON DELETE RESTRICT,
            value_num    numeric,
            value_text   text,
            value_bool   boolean,
            PRIMARY KEY (variant_id, attribute_id)
);
        
        `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        DROP TABLE variant_attribute_values;
        DROP TABLE product_attribute_values;
    
        DROP TABLE product_images;
        DROP TABLE product_variants;
        DROP  TABLE products;

        DROP TYPE product_status;
    `);
};
