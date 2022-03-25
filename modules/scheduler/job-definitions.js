
const jobDefinitions = (agenda) => {
    agenda.define("send email", (job, done) => {
        console.log(Date.now(), 'Testing schedule method', job.attrs.data);
        
        (() => {
            done();
        });
    });
};

module.exports = { jobDefinitions }