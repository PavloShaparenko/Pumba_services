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
    pgm.sql(
        `
        CREATE TYPE attribute_type AS ENUM ('enum','number','boolean', 'string');

        CREATE TABLE brands (   
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        logo_url text,
        created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE categories (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        parent bigint REFERENCES categories (id) ON DELETE RESTRICT,
        name text NOT NULL ,
        slug text NOT NULL UNIQUE,
        sort_order int NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE TABLE attributes(
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name text NOT NULL ,
        slug text NOT NULL UNIQUE,
        type  attribute_type NOT NULL,
        unit text,
        created_at timestamptz NOT NULL DEFAULT now()  
        );

        CREATE TABLE category_attributes (
        category_id bigint NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
        attribute_id bigint NOT NULL REFERENCES attributes (id) ON DELETE CASCADE,
        sort_order int NOT NULL DEFAULT 0,
        is_filter boolean NOT NULL DEFAULT true,
        is_variant boolean NOT NULL DEFAULT false,
        PRIMARY KEY (category_id, attribute_id)
        );
        
        CREATE TABLE attribute_options (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
        attribute_id bigint NOT NULL REFERENCES attributes (id) ON DELETE CASCADE,
        label text NOT NULL,
        slug text NOT NULL,
        sort_order int NOT NULL DEFAULT 0,
        UNIQUE (attribute_id, slug)
        );
        
        
        `,
    );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`
        

        DROP TABLE attribute_options;

        DROP TABLE category_attributes;

        DROP TABLE attributes;

        DROP TYPE attribute_type;

        DROP TABLE categories;

        DROP TABLE brands;
        `);
};
