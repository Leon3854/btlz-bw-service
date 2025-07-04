import cron from "node-cron";
import { updateTariffs } from "#services/tariffsService.ts";
import { updateGoogleSheetsForTariffs } from "#services/googleSheetsService";

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
