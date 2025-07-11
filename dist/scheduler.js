/**
 * Этот файл реализует планировщик (scheduler) на основе библиотеки node-cron,
 * который периодически запускает задачи по обновлению тарифов и обновлению данных в Google Sheets. Ниже подробное описание по частям:
 * cron-node - библиотека для запуска задач по расписанию (cron)
 */
import cron from "node-cron";
import { updateTariffs } from "./services/tariffsService.js";
import { updateGoogleSheetsForTariffs } from "./services/googleSheetsService.js";

/**
 * Создаёт задачу cron с расписанием "0 1 * * *".
 * Это означает: запускать задачу каждый день в 01:00 ночи.
 * Внутри задачи происходит:
 * Логируется начало обновления тарифов.
 * Вызывается асинхронная функция updateTariffs().
 * Получается текущая дата today.
 * Логируется начало обновления Google Sheets.
 * Вызывается updateGoogleSheetsForTariffs(today) — обновление таблиц с тарифами на текущую дату.
 * Логируется успешное завершение всех обновлений.
 * В случае ошибки в любом из шагов она ловится и выводится в консоль.
 */
function startScheduler() {
  // Например, обновлять тарифы каждый день в 01:00
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log("Starting tariffs update...");
      await updateTariffs();
      const today = new Date();
      console.log("Starting Google Sheets update...");
      await updateGoogleSheetsForTariffs(today);
      console.log("All updates completed");
    } catch (error) {
      console.error("Error in scheduled task:", error);
    }
  });
  console.log("Scheduler started");
}
export default startScheduler;
/**
 * Этот файл отвечает за автоматизацию регулярного обновления данных:
 * Использует cron-расписание для запуска задачи каждый день в 01:00.
 * В задаче обновляет тарифы (например, получает свежие данные, сохраняет в БД).
 * Затем обновляет Google Sheets, синхронизируя таблицы с актуальными тарифами.
 * Логирует процесс и ошибки.
 * Позволяет легко интегрировать планировщик в приложение, просто вызвав startScheduler().
 * Таким образом, этот файл реализует механизм периодического автоматического обновления тарифов и их отображения в Google Таблицах без необходимости ручного запуска.
 */
