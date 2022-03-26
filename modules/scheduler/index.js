const Agenda = require("agenda");
const mongoose = require('mongoose');
const { jobDefinitions } = require("./job-definitions");

// Fetch configuration
const { port, appUrl, databaseUrl } = require('../../config');

// Connect to database
mongoose
    .connect(databaseUrl, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to db!');
    })
    .catch(error => {
        console.error(error);
    });


const agenda = new Agenda({mongo: mongoose.connection});

// listen for the ready or error event.
agenda
    .on('ready', () => console.log("Agenda started!"))
    .on('error', () => console.log("Agenda connection error!"))
    .on('complete', function(job) { 
        console.log("Job %s finished", job.attrs.name);
        if (!job.attrs.nextRunAt) {
            job.remove(function(err) {
                console.log(err); //prints null
            });
        }
    });

// define all agenda jobs
jobDefinitions(agenda);

// logs all registered jobs 
console.log({ jobs: agenda._definitions });

agenda.start();

module.exports = agenda;