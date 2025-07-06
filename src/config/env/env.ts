/**
 * dotenv — это npm-библиотека, которая загружает переменные окружения
 * (environment variables) из файла .env в process.env в Node.js-приложениях.
 * Это стандартный способ работы с конфигурацией и секретами
 * (API-ключи, пароли, URL БД и т.д.) без хранения их в коде.
 * Загрузка переменных из .env-файла в process.env.
 * Безопасность: .env можно добавить в .gitignore, чтобы секреты не попали в репозиторий.
 * Удобство: Разные .env-файлы для разных окружений (dev/test/prod).
 */
import dotenv from "dotenv";

/**
 * Zod — это TypeScript-библиотека для валидации данных и создания схем.
 * Она помогает гарантировать, что данные соответствуют ожидаемой
 * структуре и типам, что особенно полезно при работе с внешними
 * источниками (API, формами, БД и т.д.).
 * Проверка, что входные данные (например, JSON из API) соответствуют заданной схеме.
 * Автоматическое определение типов TypeScript на основе схемы.
 * Защита от "мусорных" данных. Например, при парсинге ответа API или данных из localStorage
 * Трансформация данных. Преобразование данных после валидации (например, строку в число).
 * Работа с формами. Интеграция с React Hook Form, Formik и другими библиотеками.
 */
import { z } from "zod";

// Загружаем переменные окружения из файла .env в process.env
dotenv.config();

/**
 * Схема валидации и трансформации переменных окружения с помощью Zod.
 * - NODE_ENV: может быть "development", "production" или отсутствовать
 * - POSTGRES_HOST: строка или отсутствует
 * - POSTGRES_PORT: строка с числом, преобразуется в number
 * - POSTGRES_DB: обязательная строка
 * - POSTGRES_USER: обязательная строка
 * - POSTGRES_PASSWORD: обязательная строка
 * - APP_PORT: строка с числом или отсутствует, преобразуется в number
 */
const envSchema = z.object({
  NODE_ENV: z.union([z.undefined(), z.enum(["development", "production"])]),
  POSTGRES_HOST: z.union([z.undefined(), z.string()]),
  POSTGRES_PORT: z
    .string()
    .regex(/^[0-9]+$/)
    .transform((value) => parseInt(value)),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  APP_PORT: z.union([
    z.undefined(),
    z
      .string()
      .regex(/^[0-9]+$/)
      .transform((value) => parseInt(value)),
  ]),
});
/**
 * Парсим и валидируем переменные окружения из process.env по заданной схеме.
 * При несоответствии схемы выбрасывается исключение с описанием ошибки.
 */
const env = envSchema.parse({
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,
  APP_PORT: process.env.APP_PORT,
});

export default env;
