import env from "#config/env/env";
import { Knex } from "knex";
import { z } from "zod";
/**
 * обеспечивает централизованное и типобезопасное
 * (через zod) определение параметров подключения
 * к базе данных для различных сред (разработка и продакшен),
 * включая настройки миграций и сидов для Knex.js.
 * Что позволяет избежать ошибок с некорректными
 * параметрами подключения.
 */

const connectionSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
});

/**
 * подключение к файлу env
 * провекрка на значение develpoment, production
 */
const NODE_ENV = env.NODE_ENV ?? "development";

/**
 * Конфигурация Knex для разных окружений.
 *
 * @type {Record<"development" | "production", Knex.Config>}
 *
 */
const knegConfigs: Record<typeof NODE_ENV, Knex.Config> = {
  development: {
    /**
     * Возвращает валидированные параметры подключения к БД для development.
     * @returns {Knex.ConnectionConfig}
     */
    client: "pg",
    connection: () =>
      connectionSchema.parse({
        host: env.POSTGRES_HOST ?? "localhost",
        port: env.POSTGRES_PORT ?? 5432,
        database: env.POSTGRES_DB ?? "postgres",
        user: env.POSTGRES_USER ?? "postgres",
        password: env.POSTGRES_PASSWORD ?? "postgres",
      }),
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      stub: "src/config/knex/migration.stub.js",
      directory: "./src/postgres/migrations",
      tableName: "migrations",
      extension: "ts",
    },
    seeds: {
      stub: "src/config/knex/seed.stub.js",
      directory: "./src/postgres/seeds",
      extension: "js",
    },
  },
  /**
   * Возвращает валидированные параметры подключения к БД для production.
   * @returns {Knex.ConnectionConfig}
   */
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
      stub: "dist/config/knex/migration.stub.js",
      directory: "./dist/postgres/migrations",
      tableName: "migrations",
      extension: "js",
    },
    seeds: {
      stub: "src/config/knex/seed.stub.js",
      directory: "./dist/postgres/seeds",
      extension: "js",
    },
  },
};

export default knegConfigs[NODE_ENV];
/**
 *
 * Создаются конфигурации подключения knegConfigs для двух сред:
 *development:
 *Клиент базы — PostgreSQL (pg).
 *Параметры подключения берутся из переменных окружения с дефолтными значениями (например, localhost и порт 5432).
 *Настроены параметры пула подключений (min 2, max 10).
 *Указаны пути к миграциям и сидерам в исходной папке src.
 *Используются файлы-заготовки (stub) для миграций и сидов с расширением ts и js соответственно.
 *production:
 *Аналогичная конфигурация, но без дефолтных значений (требуется, чтобы переменные окружения были заданы).
 *Пути к миграциям и сидерам указывают на скомпилированные файлы в папке dist.
 *Файлы миграций и сидов имеют расширение js.
 *
 */
