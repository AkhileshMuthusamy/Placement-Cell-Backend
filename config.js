const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        databaseUrl: process.env.MONGO_URI,
        appUrl: `http://localhost:${port}`,
        port
    }
}

module.exports = config[env];