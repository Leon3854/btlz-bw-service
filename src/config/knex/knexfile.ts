/**
 * Настраиваем конфигурацию для подключения к базе данных PostgreSQL
 * с помощью библиотеки Knex, используя переменные окружения и
 * выбирая параметры в зависимости от текущей среды
 * (development или production).
 */
import type { Knex } from "knex";
import { config } from "dotenv";
import { dirname, resolve } from "path"; // функции для работы с путями к файлам.
import { fileURLToPath } from "url"; // преобразует URL модуля (ESM) в путь файловой системы

// Вызывает dotenv.config(), чтобы переменные из .env стали доступны в process.env
config();

// Определение путей текущего файла и папки
// В ES-модулях нет глобальных __filename и __dirname, поэтому они создаются вручную.
// Нужно, правильно указывать пути к миграциям и сидерам (файлам для инициализации базы).
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Определение текущей среды исполнения
/**
 * Считывается NODE_ENV из переменных окружения.
 * Если значение не "production", по умолчанию считается "development".
 * Это предотвращает ошибки, если NODE_ENV задан некорректно.
 */
const nodeEnvRaw = process.env.NODE_ENV;
const NODE_ENV: "development" | "production" =
  nodeEnvRaw === "production" ? "production" : "development";

// Объект конфигураций для разных сред
const knexConfigs: Record<"development" | "production", Knex.Config> = {
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
      stub: resolve(__dirname, "migration.stub.js"),
      directory: resolve(__dirname, "../../postgres/migrations"),
      tableName: "migrations",
      extension: "js",
    },
    seeds: {
      stub: resolve(__dirname, "seed.stub.js"),
      directory: resolve(__dirname, "../../postgres/seeds"),
      extension: "js",
    },
  },
};

export default knexConfigs[NODE_ENV];
