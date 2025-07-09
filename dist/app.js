import { migrate, seed } from "./postgres/knex.js";
import startScheduler from "./scheduler.js";
async function main() {
    // Выполнение всех pending миграций БД (создание/обновление таблиц)
    await migrate.latest();
    // Заполнение БД тестовыми/начальными данными
    await seed.run();
    console.log("Migrations and seeds completed");
    // Запускаем планировщик
    startScheduler();
}
// Вызов основной функции с обработкой возможных ошибок
main().catch((e) => {
    // Логирование ошибки в консоль
    console.error(e);
    // Завершение процесса с кодом ошибки (1 - failure)
    process.exit(1);
});
