export async function up(knex) {
    return knex.schema.createTable("tariffs", (table) => {
        table.increments("id").primary();
        table.string("tariff_id").notNullable().index(); // уникальный id тарифа из API
        table.string("name").notNullable();
        table.decimal("price", 10, 2).notNullable();
        table.jsonb("raw_data").notNullable(); // для хранения всей информации
        table.date("date").notNullable().index(); // дата, на которую актуален тариф
        table.timestamps(true, true);
        table.unique(["tariff_id", "date"]); // уникальность тарифа на дату
    });
}
export async function down(knex) {
    return knex.schema.dropTableIfExists("tariffs");
}
