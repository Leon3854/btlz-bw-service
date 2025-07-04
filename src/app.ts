import knex, { migrate, seed } from "#postgres/knex";
import startScheduler from "#scheduler";

async function main() {
  await migrate.latest();
  await seed.run();

  console.log("Migrations and seeds completed");

  // Запускаем планировщик
  startScheduler();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
