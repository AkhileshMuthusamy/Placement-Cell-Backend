const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
var upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 }
});

const { port, appUrl, databaseUrl } = require('./config');

mongoose
  .connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to db!');
  })
  .catch(error => {
      console.error(error);
  });

//Import Routes
const registerRoute = require('./routes/auth/register');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array('file', 12));

//Route Middleware
app.use('/api/register', registerRoute);

app.get('/', (req, res) => {
    res.send('Server is up and running!');
  });

app.listen(port, () => {
    console.log(`Server listening on ${appUrl}`);
    console.log('press CTRL+C to exit');
});