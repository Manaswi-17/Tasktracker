const app = require('./app');
const cron = require('node-cron');
const checkOverdueTasks = require('./utils/overdueChecker');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


cron.schedule('*/30 * * * * *', async () => {
  await checkOverdueTasks();
});
