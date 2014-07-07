(function () {
  "use strict";
  
  var sqlite3 = require('sqlite3').verbose();
  var Q = require('q');
  var fs = require('fs');
  var JSONLoader = require('../server/lib/JSONLoader');
  var logger = require('../server/lib/logger');
  var ProgressBar = require('../server/lib/progressBar');
  
  var file = "../server/db/HoN.sqlite";
  var exists = fs.existsSync(file);
  
  var dataLoader = new JSONLoader('./data.json');
  var data;
  
  var db;
  
  var queries = [
    'CREATE TABLE "game" ("gameid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "name" VARCHAR NOT NULL , "path" VARCHAR NOT NULL );',
    'CREATE TABLE "package" ("packageid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "gameid" INTEGER NOT NULL , "name" VARCHAR NOT NULL , "path" VARCHAR NOT NULL, FOREIGN KEY(gameid) REFERENCES game(gameid) );',
    'CREATE TABLE "tile" ("tileid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "packageid" INTEGER NOT NULL, "name" CHAR NOT NULL, FOREIGN KEY(packageid) REFERENCES package(packageid) );',
    'CREATE TABLE "tile_face" ("faceid" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "tileid" INTEGER NOT NULL, "name" CHAR NOT NULL, FOREIGN KEY(tileid) REFERENCES tile(tileid) );' 
  ];
  
  
  //------------------------------------
  //Suppression de la base de données
  //------------------------------------
  (function () {
    
    logger.info('Suppression de la base de données.');
    
    var deferred = Q.defer();
    
    if(exists) {
      fs.unlink(file, function () {
        deferred.resolve();
      });
    } else {
      deferred.resolve();
    }
    return deferred.promise;
    
    
  }())
  //------------------------------------
  //Chargement du fichier de données
  //------------------------------------
  .then(function () {
    
    logger.info('Chargement du fichier de données.');
    
    var deferred = Q.defer();
    
    dataLoader.load().then(function (pData) {
      data = pData;
      //logger.info(data);
      deferred.resolve(data);
    }, function (error) {
      deferred.reject(error);
    });
    
    
    return deferred.promise; 
  })
  //------------------------------------
  //Ouverture de la base de données
  //------------------------------------
  .then(function () {
    logger.info('Création de la base de données.');
    
    var deferred = Q.defer();
    
    db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (error) {
      if(error) {
        deferred.reject(error);
      } else {
        deferred.resolve();      
      }
      
    });
    
    return deferred.promise;
  })
  //------------------------------------
  //Création des tables
  //------------------------------------
  .then(function () {
    
    logger.info('Création des tables...');
    
    var bar = new ProgressBar(queries.length);
    
    var deferred = Q.defer();
    var promises = [];
    
    db.serialize(function() {
      queries.forEach(function(query) {
        var _deferred = Q.defer();
        promises.push(_deferred.promise);
        db.run(query, function(error) {
          bar.tick();
          if(error) {
            _deferred.reject(error);
          } else {
            _deferred.resolve();  
          }
          
        });        
      });
    });
    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
    
    return deferred.promise;
  })
  //------------------------------------
  //Insertion des jeux
  //------------------------------------
  .then(function () {
    logger.info('Insertion des jeux...');
    
    var bar = new ProgressBar(data.length);
    
    var deferred = Q.defer();
    var promises = [];
    
    db.serialize(function() {
      var request = db.prepare("INSERT INTO game (name, path) VALUES ($name, $path)");
      
      data.forEach(function(game) {
        
        var _deferred = Q.defer();
        promises.push(_deferred.promise); 
        
        request.run( {$name: game.name, $path: game.path}, function (error) {
          bar.tick();
          if(!error) {
            game.id = request.lastID;
            _deferred.resolve();
          } else {
            _deferred.reject(error);
          }
        });
      });
      
      request.finalize();
    });
    
    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
    
    return deferred.promise;
  })
  //------------------------------------
  //Insertion des package
  //------------------------------------  
  .then(function () {
    
    logger.info('Insertion des packages...');
    
    var total = 0;
    data.forEach(function (game) {
      total += game.packages.length;
    });
    
    var bar = new ProgressBar(total);
    
    var deferred = Q.defer();
    var promises = [];
    
    db.serialize(function() {
      var request = db.prepare("INSERT INTO package (gameid, name, path) VALUES ($gameid, $name, $path)");
      
      data.forEach(function(game) {
        var gameid = game.id;
        
        game.packages.forEach(function (pack) {
          var _deferred = Q.defer();
          promises.push(_deferred.promise); 

          request.run( {$gameid: gameid, $name: pack.name, $path: pack.path}, function (error) {
            bar.tick();
            if(!error) {
              pack.id = request.lastID;
              _deferred.resolve();
            } else {
              _deferred.reject(error);
            }
          }); 
        });
      });
      
      request.finalize();
    });
    
    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    });
    
    return deferred.promise;
    
  })
  
  //------------------------------------
  //Insertion des tuiles
  //------------------------------------  
  .then(function () {
    
    logger.info('Insertion des tuiles...');
    
    var total = 0;
    data.forEach(function (game) {
      game.packages.forEach(function (pack) {
        total += pack.tiles.length;
      });
    });
    
    var bar = new ProgressBar(total);
    
    var deferred = Q.defer();
    var promises = [];
    
    db.serialize(function() {
      var request = db.prepare("INSERT INTO tile (packageid, name) VALUES ($packageid, $name)");
      
      data.forEach(function(game) {
        game.packages.forEach(function (pack) {
          var packageid = pack.id;
          
          pack.tiles.forEach(function (tile) {
            var _deferred = Q.defer();
            promises.push(_deferred.promise); 

            request.run( {$packageid: packageid, $name: tile.name}, function (error) {
              bar.tick();
              if(!error) {
                tile.id = request.lastID;
                _deferred.resolve();
              } else {
                _deferred.reject(error);
              }
            }); 
          });          
        });
      });
      
      request.finalize();
    });
    
    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    }); 
    return deferred.promise;
  })
  
  
  //------------------------------------
  //Insertion des faces sur les tuiles
  //------------------------------------  
  .then(function () {
    
    logger.info('Insertion des faces sur les tuiles...');
    
    var total = 0;
    data.forEach(function (game) {
      game.packages.forEach(function (pack) {
        pack.tiles.forEach(function(tile) {
          total += tile.faces.length;
        });
      });
    });
    
    var bar = new ProgressBar(total);
    
    var deferred = Q.defer();
    var promises = [];
    
    db.serialize(function() {
      var request = db.prepare("INSERT INTO tile_face (tileid, name) VALUES ($tileid, $name)");
      
      data.forEach(function(game) {
        game.packages.forEach(function (pack) {
          pack.tiles.forEach(function (tile) {
            var tileid = tile.id;
            
            tile.faces.forEach(function (face) {
              var _deferred = Q.defer();
              promises.push(_deferred.promise); 
              request.run( {$tileid: tileid, $name: face.name}, function (error) {
                bar.tick();
                if(!error) {
                  face.id = request.lastID;
                  _deferred.resolve();
                } else {
                  _deferred.reject(error);
                }
              }); 
            }); 
          });         
        });
      });
      
      request.finalize();
    });
    
    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(error) {
      deferred.reject(error);
    }); 
    return deferred.promise;
  })
  
  
  .then(function () {
    //console.log(data[0].packages[0].tiles);
  })
  //------------------------------------
  //Erreurs
  //------------------------------------
  .catch(function (error) {
    if(error) {
      logger.error(error);
    }
  })
  //------------------------------------
  //Fin du script
  //------------------------------------
  .done(function () {
    logger.info('~THE END~');
    if(db) {
      db.close();
    }
  });
}());

