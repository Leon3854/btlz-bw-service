import { Knex } from "knex";

// создаем таблицу
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("tariffs", (table) => {
    table.increments("id").primary(); // с уникальным индефикатором (автоинкремент, первичный ключ)
    table.string("tariff_id").notNullable().index(); // тип строки VARCHAR обязательно к заполнению
    table.string("name").notNullable(); // обязательна к заполнению
    table.decimal("price", 10, 2).notNullable(); //колонка тип-decimenal(с фиксированной точностью - 10-общее количество цифр, 2-цифры после запятой) обязательно к заполнению
    table.jsonb("raw_data").notNullable(); // для хранения всей информации полученых из JSON по ключу raw_data  не должен быть пустыми
    table.date("date").notNullable().index(); // дата, на которую актуален тариф и без времени только дата ДДММГГ
    table.timestamps(true, true); // Добавит две колонки: created_at и updated_at. Параметры true, true означают, что эти поля будут автоматически заполняться текущей датой и временем при создании и обновлении записи.
    table.unique(["tariff_id", "date"]); // уникальность тарифа на дату
  });
}

// В случае необходимости можем сделать откат миграции - чтобы
// вернуть базу данных в исходное состояние до применения изменений, сделанных в функции up
// npx knex migrate: rolback
// без данной функции откат не возомжен только в ручную
export async function down(knex: Knex): Promise<void> {
  // knex.schema - обратились к кнекс объеукту управления схемой бд(таблицами колонками и т.п.)
  // dropTableIfExists - метод даст команду на удаление таблицы (tariffs) - поможет избежать ошибки
  // если таблицы небудет при выполнении мигарции
  return knex.schema.dropTableIfExists("tariffs");
}
