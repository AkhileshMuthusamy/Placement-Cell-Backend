

function getDateTimeString() {
    let current = new Date();
    let cDate = `${current.getFullYear()}` + `${(current.getMonth() + 1)}` + `${current.getDate()}`;
    let cTime = `${current.getHours()}` + `${current.getMinutes()}` + `${current.getSeconds()}`;
    let dateTime = cDate + cTime;
    return dateTime;
}

function getDateString() {
    let current = new Date();
    let cDate = `${current.getFullYear()}` + `${(current.getMonth() + 1)}` + `${current.getDate()}`;
    return cDate;
}

module.exports = {
    getDateString,
    getDateTimeString
}