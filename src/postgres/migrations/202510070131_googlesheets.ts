import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Создаем таблицу для хранения информации о Google Sheets
  await knex.schema.createTable("google_sheets", (table) => {
    table.string("id").primary(); // ID таблицы из Google
    table.string("name").nullable(); // Название листа (опционально)
    table.timestamps(true, true); // created_at и updated_at
  });

  // Создаем таблицу тарифов
  await knex.schema.createTable("tariffs", (table) => {
    table.increments("id").primary(); // уникальный индефикатор, автоинкремент первичный ключ
    table.string("tariff_id").notNullable(); // обязательный к заполнению тип varchar(длина строки столько сколько надо)
    table.string("name").notNullable(); // обязательна к заполнению  тип string
    table.decimal("price", 10, 2).notNullable(); // тип decimal - число с фиксированной точностью, определенной длины(10), 2- две сотых
    table.date("date").notNullable(); // обязательна для заполнения, дата без привязки к часам и минутам
    // добавит две колонки created_at, updated_at. true, true - означает что при создании и обновлении
    // будут заполняться автоматически дата и вермя и при обновлении
    table.timestamps(true, true);
    // Индекс для быстрого поиска по дате
    table.index(["date"]);
  });
}

/**
 * Откатывает миграцию - удаляет таблицы 'tariffs' и 'google_sheets'.
 * Вызывается при выполнении команды `knex migrate:rollback`.
 * ВНИМАНИЕ: Приведет к безвозвратной потере всех данных в этих таблицах!
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("tariffs");
  await knex.schema.dropTable("google_sheets");
}
