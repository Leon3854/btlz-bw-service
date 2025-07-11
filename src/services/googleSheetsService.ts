/**
 * Этот файл представляет собой модуль на TypeScript/JavaScript,
 * который интегрируется с Google Sheets API и базой данных PostgreSQL (через knex),
 * чтобы получать тарифы из базы и обновлять ими Google Таблицы.
 * Авторизацию и работу с Google Sheets API.
 * Получение данных из базы.
 * Обновление данных в Google Sheets.
 * Статический список таблиц для обновления
 * (в реальном проекте можно заменить на запрос к базе).
 */

import { google, sheets_v4 } from "googleapis";
import knex from "../postgres/knex.js";

/**
 * Объявляется область доступа (scope) для Google Sheets API — полный доступ к таблицам.
 * Загружаются из переменных окружения JSON с учетными данными и токеном авторизации.
 */
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS || ""; // JSON в env
const GOOGLE_SHEETS_TOKEN = process.env.GOOGLE_SHEETS_TOKEN || ""; // JSON в env

// Парсим credentials - реквезиты для входа
// Парсится JSON с учетными данными (credentials).
const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);

// авторизация в гуглу
// Создается объект авторизации auth с этими учетными данными и нужными правами.
const auth = new google.auth.GoogleAuth({
  credentials, // реквевзиты для входа
  scopes: SCOPES, // оценки
});

//Создание клиента Google Sheets API
// version: "v4" — используем 4-ю версию API Google Таблиц (самую актуальную на 2025 год).
// auth - объект аутентификации, необходимый для доступа к API
// Для всех запросов к API будет использоваться объект auth
const sheets = google.sheets({ version: "v4", auth });

interface SheetInfo {
  id: string; // Идентификатор Google таблицы
  name?: string; // Опционально имя листа
}

/**
 * Получить список Google Sheets с их ID и (опционально) именами листов.
 * В реальном приложении можно брать из базы, здесь возвращается примерный статический список.
 * @returns {Promise<SheetInfo[]>} Массив объектов с id таблиц и именами листов
 */
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
 * Получает тарифы из таблицы tariffs в базе данных PostgreSQL.
 * Фильтрует по дате (без времени).
 * Возвращает массив объектов с тарифами (tariff_id, name, price).
 */
export async function getTariffsFromDB(date: Date): Promise<any[]> {
  // получаем дату с обрезом по времени(только дату без времени)
  const dateString = date.toISOString().split("T")[0];
  return knex("tariffs")
    .select("tariff_id", "name", "price")
    .where("date", dateString);
}

/**
 * Обновляет данные в Google Sheet с заданным sheetId.
 * Использует диапазон Sheet1!A1 — обновляет с начала листа.
 * data — двумерный массив с данными для вставки в таблицу.
 * valueInputOption: "USER_ENTERED" означает, что Google Sheets
 * будет интерпретировать данные как если бы их вводил пользователь (например, формулы, даты).
 */
export async function updateGoogleSheet(
  sheetId: string,
  data: any[][] // двумерный массив первый внешний а второй внутренний и мы не знаем что за данные там
): Promise<void> {
  // Очистим лист (например, 'Sheet1')
  const range = "Sheet1!A1";

  // обнавляем электронные таблицы и их значение
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
 * Получает список таблиц для обновления.
 * Получает тарифы из БД на указанную дату.
 * Формирует массив данных для записи (с заголовком).
 * Обновляет каждую Google Таблицу этими данными.
 * Логирует успешное обновление.
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
