const agenda = require("./index");

const schedule = {
    sendEventAlert: async (job) => {
        console.log('Job \'sendEventAlert\' scheduled!');
        const agendaJob = await agenda.now("send email", job.data);
        // console.log(agendaJob);
        return agendaJob.attrs._id;
    },
    remindEventThroughEmail: async (job) => {
        console.log('Job \'remindEventThroughEmail\' scheduled!');
        const agendaJob = await agenda.schedule(job.data.dateTime, "send email", job.data);
        return agendaJob.attrs._id;
    },
  
}
  
  module.exports = { schedule }