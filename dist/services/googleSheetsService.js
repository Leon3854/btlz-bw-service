import { google } from "googleapis";
import knex from "../postgres/knex.js";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS || ""; // JSON в env
const GOOGLE_SHEETS_TOKEN = process.env.GOOGLE_SHEETS_TOKEN || ""; // JSON в env
// Парсим credentials - реквезиты для входа
const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
// авторизация в гуглу
const auth = new google.auth.GoogleAuth({
    credentials, // реквевзиты для входа
    scopes: SCOPES, // оценки
});
// version: "v4" — используем 4-ю версию API Google Таблиц (самую актуальную на 2025 год).
// auth - объект аутентификации, необходимый для доступа к API
const sheets = google.sheets({ version: "v4", auth });
/**
 * Получить список Google Sheets с их ID и (опционально) именами листов.
 * В реальном приложении можно брать из базы, здесь возвращается примерный статический список.
 * @returns {Promise<SheetInfo[]>} Массив объектов с id таблиц и именами листов
 */
export async function getGoogleSheetIds() {
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
export async function getTariffsFromDB(date) {
    // получаем дату с обрезом по времени(только дату без времени)
    const dateString = date.toISOString().split("T")[0];
    return knex("tariffs")
        .select("tariff_id", "name", "price")
        .where("date", dateString);
}
/**
 * Обновить данные в Google Sheet
 */
export async function updateGoogleSheet(sheetId, data // двумерный массив первый внешний а второй внутренний и мы не знаем что за данные там
) {
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
 */
export async function updateGoogleSheetsForTariffs(date) {
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
