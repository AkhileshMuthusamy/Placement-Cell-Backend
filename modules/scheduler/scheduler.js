const agenda = require("./index");

const schedule = {
    sendEventAlert: async (job) => {
        console.log('Job scheduled!')
        await agenda.schedule(job.data.dateTime, "send email", job.data.body);
        // await agenda.now('send email', job.data)
    },
    remindEvent: (job) => {
        agenda.schedule(job.dateTime, "send email", job.data);
    },
  
}
  
  module.exports = { schedule }