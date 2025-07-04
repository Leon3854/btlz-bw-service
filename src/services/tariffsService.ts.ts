import axios from "axios";
import knex from "#postgres/knex";
import { Tariff } from "#types/tariffs";

const WB_TARIFFS_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";

export async function fetchTariffsFromWB(): Promise<Tariff[]> {
  const response = await axios.get(WB_TARIFFS_URL);
  // Предполагаем, что API возвращает массив тарифов в response.data
  return response.data;
}

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

export async function updateTariffs(): Promise<void> {
  const tariffs = await fetchTariffsFromWB();
  const today = new Date();
  const dateString = today.toISOString().split("T")[0]; // yyyy-mm-dd
  await saveTariffsToDB(tariffs, new Date(dateString));
  console.log(`Tariffs updated for date ${dateString}`);
}
