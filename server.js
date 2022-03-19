const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
var upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
});

// Fetch configuration
const { port, appUrl, databaseUrl } = require('./config');

// Connect to database
mongoose
    .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to db!');
    })
    .catch(error => {
        console.error(error);
    });

//Import Routes
const registerRoute = require('./routes/user/register');
const loginRoute = require('./routes/user/login');
const changePasswordRoute = require('./routes/user/change-password');
const generatePasswordRoute = require('./routes/user/generate-password');
const forgotPasswordRoute = require('./routes/user/forgot-password');
const resetPasswordRoute = require('./routes/user/reset-password');
const listUserRoute = require('./routes/user/list-user');
const disableUserRoute = require('./routes/user/disable-user');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array('file', 12));

//Route Middleware
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/change-password', changePasswordRoute);
app.use('/api/generate-password', generatePasswordRoute);
app.use('/api/forgot-password', forgotPasswordRoute);
app.use('/api/reset-password', resetPasswordRoute);
app.use('/api/list-user', listUserRoute);
app.use('/api/disable-user', disableUserRoute);

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Start's the API server
app.listen(port, () => {
    console.log(`Server listening on ${appUrl}`);
    console.log('press CTRL+C to exit');
});