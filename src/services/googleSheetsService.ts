import { google, sheets_v4 } from "googleapis";
import knex from "#postgres/knex";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS || ""; // JSON в env
const GOOGLE_SHEETS_TOKEN = process.env.GOOGLE_SHEETS_TOKEN || ""; // JSON в env

// Парсим credentials
const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

interface SheetInfo {
  id: string; // Идентификатор Google таблицы
  name?: string; // Опционально имя листа
}

// Предположим, что у нас есть таблица в БД с id таблиц Google Sheets
// Для примера, создадим тип и функцию получения этих id
export async function getGoogleSheetIds(): Promise<SheetInfo[]> {
  // Здесь можно хранить таблицы в отдельной таблице БД, например google_sheets
  // Для примера жестко возвращаем массив
  return [
    { id: "sheetId1", name: "Лист1" },
    { id: "sheetId2", name: "Тарифы" },
    // ...
  ];
}

/**
 * Получить тарифы из БД для конкретной даты
 */
export async function getTariffsFromDB(date: Date): Promise<any[]> {
  const dateString = date.toISOString().split("T")[0];
  return knex("tariffs")
    .select("tariff_id", "name", "price")
    .where("date", dateString);
}

/**
 * Обновить данные в Google Sheet
 */
export async function updateGoogleSheet(
  sheetId: string,
  data: any[][]
): Promise<void> {
  // Очистим лист (например, 'Sheet1')
  const range = "Sheet1!A1";

  // Запишем данные
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: data,
    },
  });
}

/**
 * Основная функция обновления всех Google Sheets
 */
export async function updateGoogleSheetsForTariffs(date: Date): Promise<void> {
  const sheetsInfo = await getGoogleSheetIds();
  const tariffs = await getTariffsFromDB(date);

  // Формируем данные для Google Sheets: заголовки + данные
  const values = [["Tariff ID", "Name", "Price"]];
  for (const t of tariffs) {
    values.push([t.tariff_id, t.name, t.price.toString()]);
  }

  for (const sheet of sheetsInfo) {
    await updateGoogleSheet(sheet.id, values);
    console.log(`Google Sheet ${sheet.id} updated`);
  }
}
