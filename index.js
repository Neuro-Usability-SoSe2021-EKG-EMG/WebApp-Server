console.log("server started");

const path = require('path'); 
var express = require('express');
var app = express();
var serv = require('http').Server(app);

// When the root directory is called, serve 'public' statically, index.html is default
app.use('/', express.static(path.join(__dirname, 'public')))
serv.listen(2000);


// const fs = require('fs');

// fs.writeFile('001.log', 'Damian,content,more content', function (err) {
//   if (err) throw err;
//   console.log('Done!');
// });