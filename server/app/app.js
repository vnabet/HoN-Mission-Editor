(function () {
  "use strict";
  
  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var sqlite3 = require('sqlite3').verbose();
  
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  
  var port = process.env.PORT || 8180;
  var dbfile = "../db/HoN.sqlite";
  
  var router = express.Router();
  
  var db = new sqlite3.Database(dbfile, sqlite3.OPEN_READ);
  

  router.use(function (req, res, next) {
    console.log('something is happening');
    next();
  });
  
  router.get('/', function (req, res) {
    res.json({message: 'coucou'});
  });
  
  
  router.route('/:game_id/:package_id/tiles').get(function (req, res) {
    
    db.all('SELECT * FROM tile WHERE packageid = $packageid', {$packageid: req.params.package_id},  function (error, rows) {
      res.json(rows);
    });
    
    
  });
  
  
  app.use('/api', router);
  
  app.listen(port);
  
  console.log('Serveur en cours sur le port ' + port);
  
}());