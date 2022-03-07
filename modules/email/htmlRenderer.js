const ejs = require('ejs');

module.exports.render = function(ejsTemplate, dataAsObj) {
  return ejs.renderFile(ejsTemplate, dataAsObj);
};