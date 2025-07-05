/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
  /**
   * Удаляет все существующие записи из таблицы "table_name"
   * Это нужно, чтобы seed не дублировал данные при повторном запуске.
   */
  await knex("table_name").del();

  /**
   * Вставляет новые записи в таблицу "table_name"
   * с указанными значениями.
   */

  await knex("table_name").insert([
    { id: 1, colName: "rowValue1" },
    { id: 2, colName: "rowValue2" },
    { id: 3, colName: "rowValue3" },
  ]);
}
