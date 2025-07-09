import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || "development";
const knexConfigs = {
    development: {
        client: "pg",
        connection: {
            host: process.env.POSTGRES_HOST || "localhost",
            port: Number(process.env.POSTGRES_PORT) || 5432,
            database: process.env.POSTGRES_DB || "postgres",
            user: process.env.POSTGRES_USER || "postgres",
            password: process.env.POSTGRES_PASSWORD || "postgres",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            stub: resolve(__dirname, "migration.stub.ts"),
            directory: resolve(__dirname, "../../postgres/migrations"),
            tableName: "migrations",
            extension: "ts",
            disableMigrationsListValidation: true,
        },
        seeds: {
            stub: resolve(__dirname, "seed.stub.ts"),
            directory: resolve(__dirname, "../../postgres/seeds"),
            extension: "ts",
        },
    },
    production: {
        client: "pg",
        connection: {
            host: process.env.POSTGRES_HOST, // Исправлено: process.env вместо process
            port: Number(process.env.POSTGRES_PORT), // Исправлено: process.env вместо env
            database: process.env.POSTGRES_DB, // Исправлено: process.env вместо env
            user: process.env.POSTGRES_USER, // Исправлено: process.env вместо env
            password: process.env.POSTGRES_PASSWORD, // Исправлено: process.env вместо env
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            stub: resolve(__dirname, "../../dist/config/knex/migration.stub.ts"),
            directory: resolve(__dirname, "../../dist/postgres/migrations"),
            tableName: "migrations",
            extension: "ts",
        },
        seeds: {
            stub: resolve(__dirname, "seed.stub.js"),
            directory: resolve(__dirname, "../../dist/postgres/seeds"),
            extension: "js",
        },
    },
};
export default knexConfigs[NODE_ENV];
