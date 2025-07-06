import env from "#config/env/env";
import { Knex } from "knex";
import { z } from "zod";

const connectionSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
});

const NODE_ENV = env.NODE_ENV ?? "development";

const knegConfigs: Record<typeof NODE_ENV, Knex.Config> = {
  development: {
    client: "pg",
    connection: () =>
      connectionSchema.parse({
        host: process.env.POSTGRES_HOST || "localhost",
        port: Number(process.env.POSTGRES_PORT) || 5432,
        database: process.env.POSTGRES_DB || "postgres",
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "postgres",
      }),
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      stub: "src/config/knex/migration.stub.ts",
      directory: "./src/postgres/migrations",
      tableName: "migrations",
      extension: "ts",
      disableMigrationsListValidation: true, //будет игнорировать отсутсвие файлов
    },
    seeds: {
      stub: "src/config/knex/seed.stub.ts",
      directory: "./src/postgres/seeds",
      extension: "ts",
    },
  },
  production: {
    client: "pg",
    connection: () =>
      connectionSchema.parse({
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        database: env.POSTGRES_DB,
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
      }),
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      stub: "dist/config/knex/migration.stub.ts",
      directory: "./dist/postgres/migrations",
      tableName: "migrations",
      extension: "ts",
    },
    seeds: {
      stub: "src/config/knex/seed.stub.js",
      directory: "./dist/postgres/seeds",
      extension: "js",
    },
  },
};

export default knegConfigs[NODE_ENV];
