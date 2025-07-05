/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */

//up(knex) — применяется при запуске миграции. Здесь обычно
// пишут код, который создаёт или меняет структуру базы
// данных (например, создаёт таблицы, добавляет колонки и т.п.).
export async function up(knex) {
  return knex.schema;
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */

// down(knex) — применяется при откате миграции.
// Здесь обычно пишут код, который отменяет изменения,
// сделанные в up (например, удаляет созданные таблицы).
export async function down(knex) {
  return knex.schema;
}
/**
 * обе функции просто возвращают объект knex.schema без
 * каких-либо изменений — миграция не делает никаких
 * изменений в базе данных.
 */
