
const router = require('express').Router();
const User = require('../../models/user');
const Skill = require('../../models/skill');
const verifyToken = require('../../modules/auth/verifyToken');
const internalError = require('../../modules/response/internal-error');
const mongooseError = require('../../modules/response/mongoose-error');

const fs = require('fs')
const pdfParse = require('pdf-parse');
var textract = require('textract');


function extractMatchedSkills(fileContent, skills) {
    fileContent = fileContent.toLowerCase();
    fileContent = fileContent.replace(/\+/g, 'ooPLUSoo');
    fileContent = fileContent.replace(/\#/g, 'ooHASHoo');
    matchedSkills = []

    skills.forEach(skill => {
        console.log(skill.toLowerCase());

        let matchWord = skill.toLowerCase();
        matchWord = matchWord.replace(/\+/g, 'ooPLUSoo');
        matchWord = matchWord.replace(/\#/g, 'ooHASHoo');

        if (matchWord.indexOf('.') === -1) {
            if (fileContent.match(new RegExp(`\\b${matchWord}(?!\\w)`, 'g'))) {
                matchedSkills.push(skill);
            }    
        } else {
            let combination_1 = fileContent.includes(`${skill.toLowerCase()},`);
            let combination_2 = fileContent.includes(`${skill.toLowerCase()}.`);
            let combination_3 = fileContent.includes(`${skill.toLowerCase()} `);
    
            if (combination_1 || combination_2 || combination_3) {
                matchedSkills.push(skill);
            }
        }


    });

    return matchedSkills;
}


router.post('/', verifyToken, (req, res) => {
    if (!req.file) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    resume = req.file.filename;

    console.log(req.file);

    Skill.find({}).distinct('name').then(skills => {

        let matchedSkills = [];
        
        if (req.file.mimetype === 'application/pdf') {
            // let fileContent = extractPDF(`./uploads/${req.file.filename}`);
            let fileSync = fs.readFileSync(`./uploads/${req.file.filename}`);
            pdfParse(fileSync).then(result => {
                console.log(result);
                
                matchedSkills = extractMatchedSkills(result.text, skills);
                User.updateOne({id: res.locals.user.id}, {$set: {resume, skills: matchedSkills}}).then(stats => {
                    res.status(200).json({
                        data: stats,
                        error: false,
                        notification: {type: 'Info', message: 'Resume uploaded successfully.'}
                    });
                }).catch(err => {
                    if (err.hasOwnProperty('code')) {
                        mongooseError(res, err)
                    } else {
                        internalError(res, err)
                    }
                });
            }).catch(err => internalError(res, err));

        } else {
            textract.fromFileWithPath(`./uploads/${req.file.filename}`, function( error, text ) {
                console.log(text);
                matchedSkills = extractMatchedSkills(text, skills);
                User.updateOne({id: res.locals.user.id}, {$set: {resume, skills: matchedSkills}}).then(stats => {
                    res.status(200).json({
                        data: stats,
                        error: false,
                        notification: {type: 'Info', message: 'Resume uploaded successfully.'}
                    });
                }).catch(err => {
                    if (err.hasOwnProperty('code')) {
                        mongooseError(res, err)
                    } else {
                        internalError(res, err)
                    }
                });
            });
        }

    }).catch(err => internalError(res, err));


});

router.get('/', verifyToken, (req, res) => {

    if (!req.query.id) {
        return res.status(400).json({error: true, message: 'One or more required field missing' });
    }

    User.findOne({ id: req.query.id }).then(user => {
        if (!user) {
            return res.status(400).json({error: true, message: "ID doesn't exists"});
        }

        if (user.resume) {
            res.download(`./uploads/${user.resume}`);
        } else {
            res.status(400).json({
                error: true,
                message: 'No file to download' 
            })
        }
    });
});

module.exports = router;