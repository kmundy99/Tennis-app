const cron = require('node-cron');
const { sendMatchReminders, sendUnfilledMatchNotifications } = require('./notificationService');

function startScheduler() {
  // Every 15 minutes: check for 24h and 1h reminders
  cron.schedule('*/15 * * * *', async () => {
    console.log('[SCHEDULER] Running reminder checks...');
    await sendMatchReminders('24 hours', 24);
    await sendMatchReminders('1 hour', 1);
  });

  // Every hour: check for unfilled matches ~3 days out
  cron.schedule('0 * * * *', async () => {
    console.log('[SCHEDULER] Running unfilled match check...');
    await sendUnfilledMatchNotifications();
  });

  console.log('[SCHEDULER] Notification scheduler started');
}

module.exports = { startScheduler };
