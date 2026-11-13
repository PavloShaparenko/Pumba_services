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
        CREATE TABLE addresses (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        city text NOT NULL,
        street text,
        building text,
        apartment text,
        post text,
        is_default boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
        );


        CREATE INDEX addresses_user_id_idx ON addresses (user_id);

        CREATE TABLE carts (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id bigint UNIQUE REFERENCES users (id) ON DELETE CASCADE,
        session_id uuid UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at  timestamptz NOT NULL DEFAULT now(),
        CHECK (
        (user_id IS NOT NULL AND session_id IS NULL)
        OR 
        (user_id IS NULL AND session_id IS NOT NULL)        
        )
        );

        CREATE TRIGGER carts_set_updated_at 
        BEFORE UPDATE ON carts
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();

        CREATE TABLE cart_items (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cart_id bigint NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
        variant_id bigint NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
        qty int NOT NULL CHECK (qty >0),
        UNIQUE (cart_id, variant_id)
        );

        CREATE TABLE wishlists (
        user_id bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        variant_id bigint NOT NULL REFERENCES product_variants (id) ON DELETE RESTRICT,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, variant_id)
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
        DROP TABLE wishlists;
        DROP TABLE cart_items;
        DROP TABLE carts;
        DROP TABLE addresses;
        `);
};
