import nodeSchedule from 'node-schedule';

export default (app) => {
  // Check if schedule is enabled via environment variable
  const isScheduleEnabled = process.env.ENABLE_SCHEDULE === 'true' || process.env.ENABLE_SCHEDULE === '1';

  if (!isScheduleEnabled) {
    console.log('Schedule is disabled');
    // If not enabled, do not initialize the schedule
    return;
  }
  console.log('Schedule is enabled');
  nodeSchedule.scheduleJob('* * * * *', () => {
    console.log('Job has been triggered at: ', new Date());

    const rabbitmqConnection = app.get('mqConnection');
    rabbitmqConnection.sendToQueue('health-check', {
      time: new Date(),
    }).then();
  });
};
