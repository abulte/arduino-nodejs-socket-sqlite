db = require('../lib/db');

/*
 * GET home page.
 */

exports.index = function(req, res){
  var data = [];
  // db.each("SELECT ts, temp FROM temps", function(err, row) {
  //       if(err) { console.log(err); }
  //       else{
  //           data.push([row.ts, row.temp]);
  //       }
  // });
  res.render('index', { title: 'Températures', data: data });
};
