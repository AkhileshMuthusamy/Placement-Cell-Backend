const agenda = require("./index");

const schedule = {
    sendEventAlert: async (job) => {
        console.log('Job scheduled!');
        await agenda.now("send email", job.data);
    },
    remindEventThroughEmail: async (job) => {
        console.log('Job scheduled!');
        await agenda.schedule(job.data.dateTime, "send email", job.data);
    },
  
}
  
  module.exports = { schedule }