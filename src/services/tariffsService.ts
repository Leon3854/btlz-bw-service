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
 * Использует upsert (ON CONFLICT) для вставки или обновления записей.
 * @param {Tariff[]} tariffs - Массив тарифов для сохранения.
 * @param {Date} date - Дата, на которую сохраняются тарифы (только дата без времени).
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
 */
export async function updateTariffs(): Promise<void> {
  const tariffs = await fetchTariffsFromWB();
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // yyyy-mm-dd
  await saveTariffsToDB(tariffs, new Date(dateString));
  console.log(`Tariffs updated for date ${dateString}`);
}
