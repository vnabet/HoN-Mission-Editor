(function () {
  "use strict";
  
  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var sqlite3 = require('sqlite3').verbose();
  var Q = require('q');
  
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  
  var port = process.env.PORT || 8180;
  var dbfile = "../db/HoN.sqlite";
  
  var router = express.Router();
  
  var db = new sqlite3.Database(dbfile, sqlite3.OPEN_READ);
  
  var cache = [];
  

  router.use(function (req, res, next) {
    console.log('something is happening');
    if(cache[req.originalUrl]) {
      res.json(cache[req.originalUrl]);
    } else {
      next();      
    }
  });
  
  router.get('/', function (req, res) {
    res.json({message: 'coucou'});
  });
  
  
  router.route('/game').get(function (req, res) {
    db.all('SELECT * FROM game',  function (error, rows) {
      res.json(rows);
    });
    
  });
  
  router.route('/game/:game_id').get(function (req, res) {
    db.all('SELECT * FROM game WHERE gameid = $gameid', {$gameid: req.params.game_id},  function (error, rows) {
      res.json(rows);
    });
  });
  
  router.route('/game/:game_id/package').get(function (req, res) {
    db.all('SELECT * FROM package WHERE gameid = $gameid', {$gameid: req.params.game_id},  function (error, rows) {
      res.json(rows);
    });
  });
  
  router.route('/game/:game_id/package/:package_id').get(function (req, res) {
    db.all('SELECT * FROM package WHERE gameid = $gameid AND packageid = $packageid', {$gameid: req.params.game_id, $packageid: req.params.package_id},  function (error, rows) {
      res.json(rows);
    });
  });
  
  router.route('/game/:game_id/package/:package_id/tile').get(function (req, res) {
    
    var sql = 'SELECT tile.tileid, tile.packageid, tile.name FROM tile INNER JOIN package WHERE tile.packageid = $packageid AND package.gameid = $gameid AND package.packageid =tile.packageid';
    
    db.all(sql, {$gameid: req.params.game_id, $packageid: req.params.package_id},  function (error, rows) {
      var tiles = rows;
      var promises = [];
      tiles.forEach(function (tile) {
        var deferred = Q.defer();
        promises.push(deferred.promise);
        db.all('SELECT faceid, name FROM tile_face WHERE tileid = $tileid', {$tileid: tile.tileid},  function (error, rows) {
          tile.face = rows;
          deferred.resolve();
        });
      });
      
      Q.all(promises).then(function() {
        cache[req.originalUrl] = tiles;
        res.json(tiles);
      });
    });
  });
  
  app.use('/api', router, {maxAge: 86400000});
  
  app.listen(port);
  
  console.log('Serveur en cours sur le port ' + port);
  
}());