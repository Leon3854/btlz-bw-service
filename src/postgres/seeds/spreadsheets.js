/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
  await knex("spreadsheets")
    .insert([{ spreadsheet_id: "some_spreadsheet" }])
    .onConflict(["spreadsheet_id"])
    .ignore();
}

/**
 *
 * Это функция для безопасной вставки строки в
 *  таблицу spreadsheets, которая не добавит дубликат,
 * если запись с таким spreadsheet_id уже существует.
 *
 * seed — это стандартная экспортируемая функция, которую Knex вызывает, чтобы заполнить таблицу.
 * knex("spreadsheets") — обращение к таблице spreadsheets.
 * .insert([{ spreadsheet_id: "some_spreadsheet" }]) — пытаемся добавить
 * одну запись с spreadsheet_id = "some_spreadsheet".
 * .onConflict(["spreadsheet_id"]).ignore() — если в таблице уже есть
 * запись с таким spreadsheet_id (то есть конфликт по этому уникальному полю),
 * то просто игнорируем эту вставку, не вызываем ошибку.
 *
 * Зачем это нужно?
 * Чтобы при запуске сидов гарантированно добавить в таблицу определённые
 * данные.При этом избежать дублирования, если такой spreadsheet_id
 * уже есть — не сломать миграцию ошибкой.Обычно сиды используют для
 * начальной загрузки справочных данных, тестовых значений или обязательных
 * записей.
 */
