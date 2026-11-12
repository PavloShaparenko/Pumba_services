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
        CREATE TYPE user_role AS ENUM('customer', 'manager', 'admin');



        CREATE TABLE users (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email citext NOT NULL UNIQUE,
        password_hash text NOT NULL,
        phone text,
        role user_role NOT NULL DEFAULT 'customer',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
        );
        

        CREATE TRIGGER user_set_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();

        CREATE TABLE refresh_sessions (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id bigint NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        token_hash text NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        user_agent text,
        ip inet,
        created_at timestamptz NOT NULL DEFAULT now()
        );

        CREATE INDEX refresh_session_user_id_idx ON refresh_sessions (user_id);
        CREATE INDEX refresh_session_expires_at_idx ON refresh_sessions (expires_at);
        `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(
        `
        DROP TABLE refresh_sessions;
        DROP TABLE users;

        DROP TYPE user_role;

        

        
        `,
    );
};
