/*jshint forin:true, noarg:true, noempty:true, bitwise:true, eqeqeq:true, bitwise:false, strict:true, undef:true, node:true, unused:true, curly:true, white:true, indent:4, maxerr:50 */
/* require:false */
var options = require('./config/database.js');
var SessionStore = require('../index.js');
module.exports = new SessionStore(options);