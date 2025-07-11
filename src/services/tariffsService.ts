import axios from "axios";
import dotenv from "dotenv";
import knex from "../postgres/knex.js";
import { Tariff } from "../types/tariffs.js";
dotenv.config();

// аддресс
const WB_TARIFFS_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";
const token = process.env.JWT_SECRET;

/**
 * Получает тарифы из публичного API Wildberries.
 * @returns {Promise<Tariff[]>} Массив тарифов.
 * Проверяет наличие JWT-токена (выбрасывает ошибку, если токен не задан в .env)
 * Отправляет GET-запрос к Wildberries API с авторизацией через Bearer Token
 * Возвращает массив тарифов из ответа API
 * Использует axios для HTTP-запросов
 * Токен берется из переменной окружения JWT_SECRET
 * URL API жестко закодирован (WB_TARIFFS_URL)
 * Предполагает, что API возвращает данные в поле response.data
 */
export async function fetchTariffsFromWB(): Promise<Tariff[]> {
  if (!token) {
    throw new Error(
      "JWT token is not defined in environment variable JWT_SECRET"
    );
  }
  const response = await axios.get(WB_TARIFFS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // Предполагаем, что API возвращает массив тарифов в response.data
  return response.data;
}

/**
 * Сохраняет тарифы в базу данных для указанной даты.
 * Сохранение тарифов в PostgreSQL с обработкой дубликатов.
 * Использует upsert (ON CONFLICT) для вставки или обновления записей.
 * @param {Tariff[]} tariffs - Массив тарифов для сохранения.
 * @param {Date} date - Дата, на которую сохраняются тарифы (только дата без времени).
 * Для каждого тарифа в массиве - Выполним UPSERT операцию (вставка или обновление):
 * Вставляет новую запись, если тарифа с таким tariff_id на указанную дату еще нет
 * Обновляет существующую запись при конфликте (ON CONFLICT)
 * Сохраняет: Основные данные тарифа (tariff_id, name, price)
 * Сырые данные в JSON (raw_data)
 * Дату (date) без времени
 *
 * Использует Knex для работы с PostgreSQL
 * Конфликт определяется по комбинации tariff_id и date
 * При обновлении меняет: название, цену, сырые данные и метку времени (updated_at)
 * knex.fn.now() генерирует текущую timestamp на стороне БД
 *
 */
export async function saveTariffsToDB(
  tariffs: Tariff[],
  date: Date
): Promise<void> {
  // Для простоты, будем использовать upsert (Postgres ON CONFLICT)
  for (const tariff of tariffs) {
    await knex("tariffs")
      .insert({
        tariff_id: tariff.tariff_id,
        name: tariff.name,
        price: tariff.price,
        raw_data: JSON.stringify(tariff),
        date,
      })
      .onConflict(["tariff_id", "date"])
      .merge({
        name: tariff.name,
        price: tariff.price,
        raw_data: JSON.stringify(tariff),
        updated_at: knex.fn.now(),
      });
  }
}

/**
 * Обновляет тарифы: получает актуальные данные из Wildberries и сохраняет их в базу на текущую дату.
 * По завершении выводит сообщение в консоль.
 * Получает актуальные тарифы через fetchTariffsFromWB()
 * Форматирует текущую дату в строку yyyy-mm-dd
 * Сохраняет тарифы через saveTariffsToDB()
 * Выводит лог об успешном обновлении
 * Автоматически используем текущую дату
 * Объединяет все этапы работы с тарифами в один вызов
 * Логирует результат в консоль
 */
export async function updateTariffs(): Promise<void> {
  const tariffs = await fetchTariffsFromWB();
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // yyyy-mm-dd
  await saveTariffsToDB(tariffs, new Date(dateString));
  console.log(`Tariffs updated for date ${dateString}`);
}
