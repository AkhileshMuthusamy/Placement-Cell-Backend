const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

const multer = require('multer');
let storage = multer.diskStorage({
    destination: function(req, file, cb) { 
       cb(null, './uploads');    
    }, 
    filename: function (req, file, cb) {
        cb(null , file.originalname);   
    }
 });
let upload = multer({
    storage: storage,
    limits: { fieldSize: 5 * 1024 * 1024 } // 5 mb
}).single("file");

// Fetch configuration
const { port, appUrl } = require('./config');


//Import Routes
const registerRoute = require('./routes/user/register');
const loginRoute = require('./routes/user/login');
const changePasswordRoute = require('./routes/user/change-password');
const generatePasswordRoute = require('./routes/user/generate-password');
const forgotPasswordRoute = require('./routes/user/forgot-password');
const resetPasswordRoute = require('./routes/user/reset-password');
const listUserRoute = require('./routes/user/list-user');
const disableUserRoute = require('./routes/user/disable-user');
const updateUserRoute = require('./routes/user/update-user');
const profileRoute = require('./routes/user/profile');
const uploadGradeRoute = require('./routes/faculty/upload-grade');
const listGradeRoute = require('./routes/faculty/list-grade');
const deleteGradeRoute = require('./routes/faculty/delete.grade');
const studentGradeRoute = require('./routes/student/grade');
const eventRoute = require('./routes/placement/event');
const skillRoute = require('./routes/placement/skill');
const departmentRoute = require('./routes/placement/department');
const batchRoute = require('./routes/placement/batch');
const resumeRoute = require('./routes/student/resume');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload);

//Route Middleware
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/change-password', changePasswordRoute);
app.use('/api/generate-password', generatePasswordRoute);
app.use('/api/forgot-password', forgotPasswordRoute);
app.use('/api/reset-password', resetPasswordRoute);
app.use('/api/list-user', listUserRoute);
app.use('/api/disable-user', disableUserRoute);
app.use('/api/update-user', updateUserRoute);
app.use('/api/profile', profileRoute);
app.use('/api/upload-grade', uploadGradeRoute);
app.use('/api/list-grade-upload', listGradeRoute);
app.use('/api/delete-grade', deleteGradeRoute);
app.use('/api/student-grade', studentGradeRoute);
app.use('/api/event', eventRoute);
app.use('/api/skill', skillRoute);
app.use('/api/department', departmentRoute);
app.use('/api/batch', batchRoute);
app.use('/api/resume', resumeRoute);

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

// Start's the API server
app.listen(port, () => {
    console.log(`Server listening on ${appUrl}`);
    console.log('press CTRL+C to exit');
});